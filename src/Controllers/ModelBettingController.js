const { default: axios } = require("axios");
const BetProviderTable = require("../Models/BetProviderTable");
const Category = require("../Models/Category");
const GameListTable = require("../Models/GameListTable");
const crypto = require('crypto');
const { claimDailyReferralCashback } = require("./referralCashbackController");











async function addGameWithCategory(gameData, category_name, provider) {
  // Ensure category exists or create it
  const category = await Category.findOneAndUpdate(
    { category_name },
    { $setOnInsert: { category_name } },
    { new: true, upsert: true }
  );

  console.log(gameData)

  const newGame = await GameListTable.findOneAndUpdate(
    { g_code: gameData.g_code, p_code: gameData.p_code },
    { ...gameData, category_name },
    { upsert: true, new: true }
  );

  // গেমের কোড provider এর gamelist-এ ঢোকান
  await BetProviderTable.updateOne(
    { company: provider.company },
    {
      $addToSet: {
        gamelist: {
          g_code: gameData.g_code,
          p_code: gameData.p_code,
          g_type: gameData.g_type,
        },
      },
    }
  );

  // গেমের কোড category এর gamelist-এ ঢোকান
  await Category.updateOne(
    { category_name },
    {
      $addToSet: {
        gamelist: {
          g_code: gameData.g_code,
          p_code: gameData.p_code,
          g_type: gameData.g_type,
        },
      },
    }
  );

  return newGame;
}

// Fetch games from external API and add to DB
const fetchGamesFromApi = async (providerData, category_name) => {
  try {
    const { operatorcode, providercode, key } = providerData;

    const signature = crypto
      .createHash("md5")
      .update(operatorcode.toLowerCase() + providercode.toUpperCase() + key)
      .digest("hex")
      .toUpperCase();

    if (process.env.NODE_ENV !== "production") {
      console.log("Generated Signature:", signature);
    }

    const response = await axios.get("https://gsmd.336699bet.com/getGameList.ashx", {
      params: {
        operatorcode,
        providercode,
        lang: "en",
        html: "0",
        reformatjson: "yes",
        signature,
      },
    });

    console.log(`https://gsmd.336699bet.com/getGameList.ashx?operatorcode=${operatorcode}&providercode=${providercode}&lang=en&html=0&reformatjson=yes&signature=${signature}`

    );

    const gameList = JSON.parse(response.data?.gamelist);
    let gameResults = [];

    for (let game of gameList) {
      try {
        const addedGame = await addGameWithCategory(game, category_name, providerData);
        gameResults.push(addedGame);
      } catch (err) {
        console.error(`Failed to add game ${game.g_code}:`, err.message);
      }
    }

    return gameResults;
  } catch (error) {
    console.error("Error fetching games:", error.message);
    return [];
  }
};

// Main function to add provider and fetch games
exports.CasinoItemAdd = async (req, res) => {
  try {
    const {
      company,
      name,
      url,
      login_url,
      username,
      password,
      providercode,
      operatorcode,
      key,
      auth_pass,
      currency_id,
      category_name,
      image_url,
      g_type
    } = req.body;

    const providerData = {
      company,
      name,
      url,
      login_url,
      username,
      password,
      providercode,
      operatorcode,
      key,
      auth_pass,
      currency_id,
      image_url,
      g_type,
      updatetimestamp: Date.now(),
    };

    const result = await BetProviderTable.findOneAndUpdate(
      { company },
      providerData,
      { new: true, upsert: true }
    );

    const NewResult = await fetchGamesFromApi(result, category_name);

    res.json({ success: true, data: NewResult });
  } catch (error) {
    console.error("Error adding casino item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};






exports.CasinoItemSingleUpdate = async (req, res) => {
  console.log(req.body)
  // console.log(req.body);
  try {
    const {
      gameData
    } = req.body;


    const filter = { g_code: gameData.g_code };
    const update = {
      category_name: gameData.category_name,
      serial_number: gameData.serial_number,
      updatetimestamp: Date.now(),
    };

    console.log(filter)
    console.log(gameData)
    console.log(update)

    const result = await GameListTable.findOneAndUpdate(filter,
      update, {
      new: true,
      upsert: true // Make this update into an upsert
    })
    res.status(200).json({ return: true, message: 'Update successful', result })

  } catch (error) {
    console.error("Error adding casino item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}



exports.updateSerialNumber = async (req, res) => {
  console.log(req.body.id, req.body.serial_number)
  try {

    const { id, serial_number } = req.body;



    console.log("line-2", id, serial_number)
    const result = await GameListTable.findOneAndUpdate({ g_code: id }, { serial_number }, { new: true });
    console.log(result)
    res.json({ message: "Category updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Error updating serial number" });
  }
}

exports.updateCategoryGameByID = async (req, res) => {
  console.log(req.body.id, req.body.category_name)
  try {

    const { id, category_name } = req.body;




    console.log("line-2", id, category_name)
    const result = await GameListTable.findOneAndUpdate({ g_code: id }, { category_name }, { new: true });
    console.log(result)
    res.json({ message: "Category updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
}





exports.searchGames = async (req, res) => {

  const { provider, category, game } = req.query;

  try {
    let p_code = provider;
    let category_name = category;
    let gameName_enus = game;
    // console.log(gameName_enus)
    // let newGame = {gameNam:gameName.gameName_enus}

    // Combine provider, category, and game searches with regex in the same query
    let searchQuery = {};

    // Only search if at least one parameter is provided
    if (

      p_code || category_name || gameName_enus) {
      searchQuery = {
        $and: []
      };

      // Search for provider
      if (p_code) {
        searchQuery.$and.push({
          'p_code': { $regex: p_code, $options: 'i' } // Case-insensitive regex for provider
        });
      }

      // Search for category
      if (category_name) {
        searchQuery.$and.push({
          'category_name': { $regex: category_name, $options: 'i' } // Case-insensitive regex for category
        });
      }

      // Search for game
      if (gameName_enus) {

        searchQuery.$and.push({
          'gameName.gameName_enus': { $regex: gameName_enus, $options: 'i' } // Case-insensitive regex for game
        });
      }
    }

    const results = await GameListTable.find(searchQuery || {})




    // Find all games matching the query

    // Send the results
    res.json(results,);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}



exports.GetAllProvider = async (req, res) => {
  try {
    const provider = await BetProviderTable.aggregate([

      {
        $project: {
          company: 1,
          providercode: 1,

        },
      },
    ]);
    res.status(200).json({ status: "success", data: { provider } })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}



exports.GetAllCategory = async (req, res) => {
  try {
    const AllCategory = await Category.aggregate([

      {
        $project: {
          category_name: 1,
          category_code: 1,
          image: 1,

        },
      },
    ]);
    res.status(200).json({ status: "success", data: AllCategory })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}



exports.CreateCategory = async (req, res) => {
  try {

    const { category_name, category_code, g_code, p_code, id_active, imageUrl } = req.body;

    const updateData = await Category.create({
      category_name,
      category_code,
      g_code,
      p_code,
      id_active,
      image: imageUrl,
    });

    const CategoryData = await Category.create(updateData);
    res.json(CategoryData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}




exports.ShowFrontTable = async (req, res) => {
  console.log(req.body)
  try {


    const categoryId = await Category.find({});
    console.log(categoryId)

    const categories = await Category.aggregate([
      {
        $match: { categoryId: { $in: categoryId }, p_type: { $in: p_type } },

      },
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "category",
          as: "games",
        },
      },
      {
        $unwind: "$games",
      },
      {
        $lookup: {
          from: "providers",
          localField: "games.provider",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $unwind: "$provider",
      },
      {
        $group: {
          _id: "$_id",
          categoryName: { $first: "$name" },
          providers: {
            $push: {
              providerId: "$provider._id",
              providerName: "$provider.name",
              games: {
                gameId: "$games._id",
                gameName: "$games.name",
              },
            },
          },
        },
      },
    ]);


    console.log(categories)
    res.json(categories);

    // if (!id || !serial_number) {
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}








exports.getCategoriesWithGamesAndProviders = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find({ id_active: true }).sort({ category_code: 1 });

    const categoriesWithGamesAndProviders = await Promise.all(
      categories.map(async (category) => {
        const games = await GameListTable.aggregate([
          {
            $match: {
              g_type: category.g_type, // Direct match on g_type
              category_name: category.category_name, // Direct match on category_name
            },
          },
          {
            $lookup: {
              from: "betprovidertables",
              localField: "p_code",
              foreignField: "providercode",
              as: "providers",
            },
          },
          {
            $project: {
              g_code: 1,
              g_type: 1,
              p_code: 1,
              p_type: 1,
              gameName: 1,
              imgFileName: 1,
              serial_number: 1,
              "providers.providercode": 1,
            },
          },
        ]);

        const providerSet = new Set();
        games.forEach((game) => {
          game.providers.forEach((provider) =>
            providerSet.add(provider.providercode)
          );
        });

        const uniqueProviders = await BetProviderTable.find(
          { providercode: { $in: Array.from(providerSet) } },
          {
            company: 1,
            providercode: 1,
            url: 1,
            image_url: 1,
            p_type: 1,
            serial_number: 1,
            _id: 0,
          }
        ).sort({ serial_number: 1 });
        // console.log("Unique Providers:", uniqueProviders);

        // Format the result
        return {
          category: {
            name: category.category_name,
            p_type: category.p_type,
            image: category.image,
            id_active: category.id_active, // Check if category is active
            uniqueProviders: uniqueProviders,
          },
          // games: games, // Include games under the category
        };
      })

    );
    // console.log("Games:", categoriesWithGamesAndProviders);
    res.json(categoriesWithGamesAndProviders);
  } catch (error) {
    console.error("Error fetching categories with games and providers:", error);
    res.status(500).json({ error: error.message });
  }
}











exports.ShowGameListById = async (req, res) => {
  try {
    const gameId = req.params.id;


    const game = await GameListTable.findOne({ g_code: gameId });

    // Find the game based on g_code
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Server error" });
  }
};



exports.DeleteGameListByGtype = async (req, res) => {
  try {
    const { p_code, p_type } = req.body; // Destructure from body
    console.log("Deleting games with p_type:", p_code, p_type);

    const result = await GameListTable.deleteMany({ p_code: p_code });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No games found with given p_type" });
    }

    res.json({ message: "Games deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting games:", error);
    res.status(500).json({ error: "Server error" });
  }
};








exports.GetGameList = async (req, res) => {
  try {

    // .populate('category_id', 'category_name');
    const game = await GameListTable.find()
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}




exports.getCategoriesWithProviders = async (req, res) => {
  try {
    // const { provider, category, game } = req.body
    const { provider, category, game } = req.query;
    // Fetch all categories
    const categories = await Category.find({ category_name: category });


    // Fetch games for each category along with their providers
    const categoriesWithGamesAndProviders = await Promise.all(
      categories.map(async (category) => {
        // Fetch games for each category
        const games = await GameListTable.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "g_type",
              foreignField: "g_type",
              as: "matchedCategories",
            },
          },
          {
            $match: {
              "matchedCategories.category_name": category.category_name, // Match category name
            },
          },
          {
            $lookup: {
              from: "betprovidertables",
              localField: "p_code",
              foreignField: "providercode",
              as: "providers",
            },
          },
          {
            $project: {
              g_code: 1,
              g_type: 1,
              p_code: 1,
              p_type: 1,
              gameName: 1,
              imgFileName: 1,
              serial_number: 1,
              "providers.providercode": 1,
            },
          },
        ]);

        const providerSet = new Set();
        games.forEach(game => {
          game.providers.forEach(provider => providerSet.add(provider.providercode));
        });

        const uniqueProviders = await BetProviderTable.find(
          { providercode: { $in: Array.from(providerSet) } },
          { company: 1, providercode: 1, url: 1, image_url: 1, _id: 0 }
        );

        // Format the result
        return {

          uniqueProviders,
          categories


        };
      })
    );

    res.json(categoriesWithGamesAndProviders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




// Update g_type list by providercode & company
exports.updateGTypeList = async (req, res) => {
  try {
    const { providercode, g_type } = req.body;

    // Check required fields
    if (!providercode || !g_type) {
      return res.status(400).json({ success: false, message: "providercode and g_type are required" });
    }

    // Find provider by providercode
    const provider = await BetProviderTable.findOne({ providercode });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // Ensure g_type is an array for consistency
    const newGTypes = Array.isArray(g_type) ? g_type : [g_type];

    // Filter only unique new types not already present
    const uniqueToAdd = newGTypes.filter(type => !provider.g_type.includes(type));

    if (uniqueToAdd.length === 0) {
      return res.status(200).json({ success: true, message: "All g_types already exist", g_type: provider.g_type });
    }

    // Update provider with new g_types
    provider.g_type.push(...uniqueToAdd);
    provider.updatetimestamp = new Date();

    await provider.save();

    res.status(200).json({
      success: true,
      message: `Added new g_types: ${uniqueToAdd.join(', ')}`,
      updatedProvider: provider
    });

  } catch (error) {
    console.error("Error updating g_type:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}



// exports.getCategoriesWithProvidersGameList = async (req, res) => {
//   try {
//     let { 
//       provider = [], 
//       category, 
//       page = 1, 
//       gameName = '',
//       sortBy = 'serial_number',
//       sortOrder = 'asc'
//     } = req.query;

//     console.log(req.query)

//     console.log(provider, category, page, gameName, sortBy, sortOrder);
//     // Validate and parse inputs
//     /* page = parseInt(page); */
//     if (isNaN(page) || page < 1) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid page number" 
//       });
//     }

//     const limit = 24;
//     const skip = (page - 1) * limit;

//     // Check if category exists
//     const categoryData = await Category.findOne({ category_name: category });
//     if (!categoryData) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Category not found" 
//       });
//     }

//     // Convert single provider to array if not already
//     if (!Array.isArray(provider)) {
//       provider = [provider].filter(Boolean);
//     }

//     // Build dynamic query
//     const query = {
//       category_name: category,
//       is_active: true,
//     };

//     // Optional filters
//     if (provider.length > 0) {
//       query.p_code = { $in: provider };
//     }

//     if (gameName) {
//       query['$or'] = [
//         { 'gameName.gameName_enus': { $regex: gameName, $options: 'i' } },
//         { 'gameName.gameName_zhcn': { $regex: gameName, $options: 'i' } },
//         { name: { $regex: gameName, $options: 'i' } }
//       ];
//     }

//     // Sort options mapping


//     // Determine sort

//     // Fetch paginated games with sorting
//     const games = await GameListTable.find(query)
//       .skip(skip)
//       .limit(limit);

//     // Total count for pagination
//     const total = await GameListTable.countDocuments(query);

//     // Get all unique providers for this category
//     const providers = await GameListTable.distinct('p_code', { 
//       category_name: category 
//     });

//     res.json({
//       success: true,
//       data: games,
//       pagination: {
//         page,
//         limit,
//         total,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching games:", error);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//     });
//   }
// };

exports.getCategoriesWithProvidersGameList = async (req, res) => {
  try {
    let { provider = [], category, page = 1, gameName = '', sortBy = 'serial_number', sortOrder = 'asc' } = req.query;

    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;
    const limit = 24;
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    if (!Array.isArray(provider)) provider = [provider].filter(Boolean);

    // --- Step 1: Find category ---
    const categoryData = await Category.findOne({ category_name: category, id_active: true }).select('g_type category_name');
    if (!categoryData) return res.status(404).json({ success: false, message: "Category not found" });

    // --- Step 2: Fetch providers from cache ---
    const providersCacheKey = `providers:category:${category}`;
    let providersData = await redis.get(providersCacheKey);

    if (providersData) {
      providersData = JSON.parse(providersData);
    } else {
      const providerQuery = { g_type: { $in: categoryData.g_type }, id_active: true };
      providersData = await BetProviderTable.find(providerQuery).select('_id company g_type name');
      await redis.set(providersCacheKey, JSON.stringify(providersData), 'EX', 600); // cache 10 min
    }

    if (!providersData.length) return res.status(404).json({ success: false, message: "No providers found" });

    // Filter providers if user selected specific ones
    if (provider.length > 0) {
      providersData = providersData.filter(p => provider.includes(p._id.toString()));
    }

    if (!providersData.length) return res.status(404).json({ success: false, message: "No matching providers found" });

    // --- Step 3: Collect g_types from providers ---
    const providerGTypes = providersData.flatMap(p => p.g_type);
    const matchedGTypes = categoryData.g_type.filter(gt => providerGTypes.includes(gt));

    // --- Step 4: Fetch games from cache ---
    const gamesCacheKey = `games:category:${category}:providers:${providersData.map(p => p._id).join(',')}:page:${page}:name:${gameName}:sort:${sortBy}:${sortOrder}`;
    let gamesData = await redis.get(gamesCacheKey);

    if (gamesData) {
      gamesData = JSON.parse(gamesData);
    } else {
      const gameQuery = { g_type: { $in: matchedGTypes }, is_active: true };
      if (gameName) gameQuery.$text = { $search: gameName };

      const totalGames = await GameListTable.countDocuments(gameQuery);

      const games = await GameListTable.find(gameQuery)
        .select('g_code g_type gameName imgFileName serial_number')
        .sort(sortBy === 'gameName' ? { 'gameName.gameName_enus': sortDirection } : { serial_number: sortDirection })
        .skip(skip)
        .limit(limit);

      gamesData = { games, totalGames };
      await redis.set(gamesCacheKey, JSON.stringify(gamesData), 'EX', 300); // cache 5 min
    }

    // --- Step 5: Send response ---
    res.json({
      success: true,
      category: categoryData,
      providers: providersData,
      games: gamesData.games,
      pagination: {
        page,
        limit,
        totalGames: gamesData.totalGames,
        totalPages: Math.ceil(gamesData.totalGames / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.searchGamesByName = async (req, res) => {
  console.log(req)
  try {
    let { q = '', lang = 'enus' } = req.query;
    console.log(req.query)
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required' });
    }

    // Supported language fields
    const supportedLangs = ['enus', 'zhcn', 'zhtw', 'bn'];
    if (!supportedLangs.includes(lang)) {
      return res.status(400).json({ success: false, message: `Unsupported language: ${lang}` });
    }

    // Construct dynamic field for search e.g. 'gameName.gameName_enus'
    const searchField = `gameName.gameName_${lang}`;

    // Case-insensitive regex search
    const regex = new RegExp(q.trim(), 'i');

    const games = await GameListTable.find({
      [searchField]: regex,
      is_active: true // optional filter to return only active games
    })


    return res.json({ success: true, count: games.length, data: games });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.moveGamesToAnotherCategory = async (req, res) => {
  console.log(req.body)
  try {
    const {
      fromCategoryName,
      toCategoryName,
      gamesToMove // গেমের array: [{ g_code, p_code }]
    } = req.body;

    if (!fromCategoryName || !toCategoryName || !Array.isArray(gamesToMove)) {
      return res.status(400).json({ success: false, message: 'অনুগ্রহ করে সব তথ্য দিন।' });
    }

    // দুই ক্যাটাগরির তথ্য খোঁজা
    const fromCategory = await Category.findOne({ category_name: fromCategoryName });
    const toCategory = await Category.findOne({ category_name: toCategoryName });
    console.log(fromCategory, toCategory)
    if (!fromCategory || !toCategory) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি।' });
    }

    // গেম ফিল্টার করে যেগুলো স্থানান্তর করতে হবে
    const gamesToRemove = new Set(gamesToMove.map(game => game.g_code + game.p_code));
    console.log(gamesToRemove)
    // পুরাতন ক্যাটাগরি থেকে গেম সরানো
    fromCategory.gamelist = fromCategory.gamelist.filter(
      game => !gamesToRemove.has(game.g_code + game.p_code)
    );
    console.log(fromCategory.gamelist)
    // নতুন ক্যাটাগরিতে গেম যোগ করা (ডুপ্লিকেট এড়াতে filter)
    const existingSet = new Set(toCategory.gamelist.map(game => game.g_code + game.p_code));
    console.log("existingSet", existingSet)
    const newGames = gamesToMove.filter(
      game => !existingSet.has(game.g_code + game.p_code)
    );
    console.log("newGames", newGames)
    toCategory.gamelist.push(...newGames);

    // GameListTable আপডেট করা যাতে category_name পরিবর্তিত হয়
    for (let game of gamesToMove) {
      console.log("GameListTable", game)
      await GameListTable.updateMany(
        { g_code: game.g_code, p_code: game.p_code },
        {
          category_name: toCategoryName,
          g_type: toCategory.g_type,
          new_brand: game.g_code,
          new_category_name: toCategoryName,
        }
      );
    }
    console.log("GameListTable", toCategory)
    // সংরক্ষণ
    await fromCategory.save();
    await toCategory.save();

    res.status(200).json({
      success: true,
      message: 'গেম সফলভাবে স্থানান্তর করা হয়েছে।',
      movedGames: gamesToMove
    });

  } catch (err) {
    console.error('ত্রুটি:', err);
    res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি হয়েছে।' });
  }
};












exports.AddCetagory = async (req, res) => {
  const { category, id } = req.body;
  const imageFile = req.file;

  let data = {
    name: category,
    staff_id: id,  // Replace with actual authenticated staff user ID
  };

  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImageToImgBB(imageFile);
      data.image = imageUrl;
    }

    if (id && id !== "0") {
      // Update existing category
      if (!categoryToUpdate) {
        return res.status(404).json({ message: 'Category not found' });
        const categoryToUpdate = await SportsCategoryTable.findById(id);
      }

      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
        data.image = imageUrl;
      }

      return res.status(200).json({ message: 'Category updated successfully' });
    } else {
      await OddSportsTable.findByIdAndUpdate(id, data, { new: true });
      // Create new category
      const newCategory = new SportsCategoryTable(data);
      await newCategory.save();
      return res.status(201).json({ message: 'Category added successfully', category: newCategory });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};








exports.climReferralBonus = async (req, res) => {
  try {
    const userId = req.user.userId; // assuming auth middleware sets req.user
    const result = await claimDailyReferralCashback(userId);
    res.json(result);
  } catch (error) {
    console.error('❌ /claim-referral-cashback error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}