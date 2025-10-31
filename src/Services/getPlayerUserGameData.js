const GameListTable = require('../Models/GameListTable');
const Category = require('../Models/Category');
const Provider = require('../Models/BetProviderTable');

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