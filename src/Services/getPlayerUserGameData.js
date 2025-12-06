const GameListTable = require('../models/GameListTable');
const Category = require('../models/Category');
const Provider = require('../models/BetProviderTable');

// Cache setup
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Get categories with providers
exports.getCategoriesWithProviders = async (req, res) => {
  try {
    const { category_name, providercode } = req.query;
    
    // Build category filter
    const categoryFilter = { id_active: true };
    if (category_name) {
      categoryFilter.g_type = category_name;
    }

    // Get categories
    const categories = await Category.find(categoryFilter)
      .select('category_name category_code g_type image')
      .lean();

    if (categories.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Extract and normalize g_types from categories
    const categoryGTypes = categories
      .map(cat => cat.g_type)
      .filter(gType => gType && typeof gType === 'string' && gType.trim() !== '')
      .map(gType => gType.trim());

    let providers = [];
    
    // Build provider filter
    const providerFilter = { id_active: true };
    
    if (categoryGTypes.length > 0) {
      if (providercode) {
        providerFilter.providercode = providercode;
        providerFilter.$or = [
          { g_type: { $in: categoryGTypes } },
          { g_type: { $in: categoryGTypes.map(type => [type]) } },
          { g_type: { $elemMatch: { $in: categoryGTypes } } }
        ];
      } else {
        providerFilter.$or = [
          { g_type: { $in: categoryGTypes } },
          { g_type: { $in: categoryGTypes.map(type => [type]) } },
          { g_type: { $elemMatch: { $in: categoryGTypes } } }
        ];
      }
    } else if (providercode) {
      providerFilter.providercode = providercode;
    }

    // Fetch providers
    providers = await Provider.find(providerFilter)
      .select('name providercode g_type url image_url login_url type company id_active')
      .lean();

    // Create provider map
    const providerMap = {};
    
    providers.forEach(provider => {
      let providerGTypes = [];
      
      if (Array.isArray(provider.g_type)) {
        providerGTypes = provider.g_type;
      } else if (typeof provider.g_type === 'string') {
        providerGTypes = provider.g_type.split(',').map(t => t.trim()).filter(t => t);
      } else if (provider.g_type) {
        providerGTypes = [String(provider.g_type)];
      }
      
      providerGTypes.forEach(gType => {
        if (!gType || typeof gType !== 'string') return;
        
        const normalizedGType = gType.trim().toLowerCase();
        if (!providerMap[normalizedGType]) {
          providerMap[normalizedGType] = [];
        }
        
        const exists = providerMap[normalizedGType].some(p => 
          p.providercode === provider.providercode
        );
        
        if (!exists) {
          providerMap[normalizedGType].push(provider);
        }
      });
    });

    // Build result
    const result = categories.map(category => {
      if (!category.g_type || typeof category.g_type !== 'string') {
        return {
          category_name: category.category_name,
          category_code: category.category_code,
          g_type: category.g_type,
          image: category.image,
          uniqueProviders: [],
          providerCount: 0
        };
      }

      const normalizedCategoryGType = category.g_type.trim().toLowerCase();
      const matchedProviders = providerMap[normalizedCategoryGType] || [];
      
      return {
        category_name: category.category_name,
        category_code: category.category_code,
        g_type: category.g_type,
        image: category.image,
        uniqueProviders: matchedProviders,
        providerCount: matchedProviders.length
      };
    });

    // Sort by category_name
    result.sort((a, b) => (a.category_code || '').localeCompare(b.category_code || ''));

    const response = {
      success: true,
      count: result.length,
      data: result
    };

    return res.json(response);

  } catch (err) {
    console.error('Error fetching categories with providers:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
};

// Get games with providers by category (with pagination and filters)
exports.getGamesWithProvidersByCategory = async (req, res) => {
  try {
    const { 
      category_name, 
      provider, 
      gameName, 
      sortBy = 'recommend',
      page = 0, 
      limit = 24 
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);

    // Build base filter
    const filter = { is_active: true };

    // Category filter
    if (category_name && category_name !== 'ALL') {
      filter.category_name = category_name;
    }

    // Provider filter
    if (provider && provider !== '' && provider !== 'ALL') {
      if (provider.includes(',')) {
        // Multiple providers
        const providerCodes = provider.split(',').map(p => p.trim());
        filter.p_code = { $in: providerCodes };
      } else {
        // Single provider
        filter.p_code = provider;
      }
    }

    // Game name search filter
    if (gameName && gameName.trim() !== '') {
      filter.$or = [
        { 'gameName.gameName_enus': { $regex: gameName, $options: 'i' } },
        { 'gameName.gameName_zhcn': { $regex: gameName, $options: 'i' } },
        { 'gameName.gameName_zhtw': { $regex: gameName, $options: 'i' } },
        { gameNameTrial: { $regex: gameName, $options: 'i' } }
      ];
    }

    console.log('Game filter:', filter);

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'latest':
        sort = { timestamp: -1 };
        break;
      case 'favorite':
        sort = { isFeatured: -1, is_hot: -1 };
        break;
      case 'aZ':
        sort = { 'gameName.gameName_enus': 1 };
        break;
      case 'recommend':
      default:
        sort = { isFeatured: -1, is_hot: -1, serial_number: 1 };
        break;
    }

    // Execute query with pagination
    const games = await GameListTable.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit) + 1) // Get one extra to check if there are more
      .lean();

    // Check if there are more results
    const hasMore = games.length > parseInt(limit);
    if (hasMore) {
      games.pop(); // Remove the extra item
    }

    // Transform games data
    const transformedGames = games.map(game => ({
      _id: game._id,
      g_code: game.g_code,
      p_code: game.p_code,
      gameName: game.gameName?.gameName_enus || game.gameNameTrial || 'Unknown Game',
      image_url: game.imgFileName ? game.imgFileName :game.imgFileName,
      category_name: game.category_name,
      is_hot: game.is_hot,
      isFeatured: game.isFeatured,
      provider: game.p_code,
      brand: game.brand,
      externalgid: game.externalgid,
      h5: game.h5,
      web: game.web,
      status: game.status,
      serial_number: game.serial_number,
      timestamp: game.timestamp
    }));

    // Get unique providers for the current filter
    const providerFilter = { id_active: true };
    if (category_name && category_name !== 'ALL') {
      providerFilter.g_type = category_name;
    }

    const providers = await Provider.find(providerFilter)
      .select('name providercode company')
      .lean();

    const response = {
      success: true,
      data: transformedGames,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore,
        total: transformedGames.length
      },
      providers: providers.map(p => ({
        _id: p._id,
        providercode: p.providercode,
        company: p.company,
        name: p.name
      }))
    };

    return res.json(response);

  } catch (err) {
    console.error('Error fetching games with providers:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
};

// Get all providers
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ id_active: true })
      .select('name providercode company g_type image_url')
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: providers,
      count: providers.length
    });
  } catch (err) {
    console.error('Error fetching providers:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
};

// Search games by name
exports.searchGames = async (req, res) => {
  try {
    const { query, category_name, provider, page = 0, limit = 20 } = req.query;
    const skip = parseInt(page) * parseInt(limit);

    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 0, limit, hasMore: false, total: 0 }
      });
    }

    const filter = { 
      is_active: true,
      $or: [
        { 'gameName.gameName_enus': { $regex: query, $options: 'i' } },
        { 'gameName.gameName_zhcn': { $regex: query, $options: 'i' } },
        { 'gameName.gameName_zhtw': { $regex: query, $options: 'i' } },
        { gameNameTrial: { $regex: query, $options: 'i' } },
        { p_code: { $regex: query, $options: 'i' } }
      ]
    };

    // Additional filters
    if (category_name && category_name !== 'ALL') {
      filter.category_name = category_name;
    }

    if (provider && provider !== '' && provider !== 'ALL') {
      if (provider.includes(',')) {
        const providerCodes = provider.split(',').map(p => p.trim());
        filter.p_code = { $in: providerCodes };
      } else {
        filter.p_code = provider;
      }
    }

    const games = await GameListTable.find(filter)
      .sort({ isFeatured: -1, is_hot: -1, 'gameName.gameName_enus': 1 })
      .skip(skip)
      .limit(parseInt(limit) + 1)
      .lean();

    const hasMore = games.length > parseInt(limit);
    if (hasMore) {
      games.pop();
    }

    const transformedGames = games.map(game => ({
      _id: game._id,
      g_code: game.g_code,
      p_code: game.p_code,
      gameName: game.gameName?.gameName_enus || game.gameNameTrial || 'Unknown Game',
      image_url: game.imgFileName ? `https://img.s628b.com/upload/game/${game.p_code}/${game.imgFileName}` : null,
      category_name: game.category_name,
      is_hot: game.is_hot,
      isFeatured: game.isFeatured,
      provider: game.p_code
    }));

    return res.json({
      success: true,
      data: transformedGames,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore,
        total: transformedGames.length
      }
    });

  } catch (err) {
    console.error('Error searching games:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
};

// Get featured games
exports.getFeaturedGames = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const games = await GameListTable.find({ 
      is_active: true, 
      isFeatured: true 
    })
      .sort({ serial_number: 1, timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    const transformedGames = games.map(game => ({
      _id: game._id,
      g_code: game.g_code,
      p_code: game.p_code,
      gameName: game.gameName?.gameName_enus || game.gameNameTrial || 'Unknown Game',
      image_url: game.imgFileName ? `https://img.s628b.com/upload/game/${game.p_code}/${game.imgFileName}` : null,
      category_name: game.category_name,
      is_hot: game.is_hot,
      isFeatured: game.isFeatured,
      provider: game.p_code
    }));

    return res.json({
      success: true,
      data: transformedGames,
      count: transformedGames.length
    });

  } catch (err) {
    console.error('Error fetching featured games:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
};

// Get all games
exports.getAllGames = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      category,
      provider,
      is_active 
    } = req.query;
console.log(req.query);
    const query = {};
    
    if (search) {
      query.$or = [
        { 'gameName.gameName_enus': { $regex: search, $options: 'i' } },
        { 'gameName.gameName_zhcn': { $regex: search, $options: 'i' } },
        { 'gameName.gameName_zhtw': { $regex: search, $options: 'i' } },
        { gameNameTrial: { $regex: search, $options: 'i' } },
        { g_code: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category_name = category;
    if (provider) query.p_code = provider;
    if (is_active !== undefined) query.is_active = is_active === 'true';

    const games = await GameListTable.find(query)
      .sort({ serial_number: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await GameListTable.countDocuments(query);

    res.json({
      success: true,
      data: games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching games',
      error: error.message
    });
  }
};

// Get game by ID
exports.getGameById = async (req, res) => {
  try {
    const game = await GameListTable.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game',
      error: error.message
    });
  }
};

// Create new game
exports.createGame = async (req, res) => {
  try {
    const gameData = req.body;

    // Check if game already exists
    const existingGame = await GameListTable.findOne({
      g_code: gameData.g_code,
      p_code: gameData.p_code
    });

    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'Game with this code and provider already exists'
      });
    }

    const game = new GameListTable(gameData);
    await game.save();

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: game
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating game',
      error: error.message
    });
  }
};

// Update game
exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatetimestamp: new Date() };

    const game = await GameListTable.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game updated successfully',
      data: game
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating game',
      error: error.message
    });
  }
};

// Delete game
exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await GameListTable.findByIdAndDelete(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message
    });
  }
};


// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log(req.query);
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { category_name: { $regex: search, $options: 'i' } },
        { category_code: { $regex: search, $options: 'i' } },
        { g_type: { $regex: search, $options: 'i' } }
      ];
    }

    const categories = await Category.find(query)
      .sort({ category_name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { category_name, category_code, g_type, image, id_active = true } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [
        { category_name },
        { category_code }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or code already exists'
      });
    }

    const category = new Category({
      category_name,
      category_code,
      g_type,
      image,
      id_active
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatetimestamp: new Date() };

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};