const { default: axios } = require("axios");
const BetProviderTable = require("../Models/BetProviderTable");
const Category = require("../Models/Category");
const GameListTable = require("../Models/GameListTable");
const crypto = require('crypto');













async function addGameWithCategory(gameData, category_name) {


  
  // if (!category_name) {
    let category = await Category.findOne({ category_name });
  //   category = new Casino_category_table.create({ category_name });

  // }

  let newGame;
  if (!category) {
    newGame = await GameListTable.create(
      // Assuming `game_id` is unique
      { ...gameData, category_name },

    );
  } else {
    // Assuming `game_id` is unique
    
    newGame = await GameListTable.findOneAndUpdate(
      { g_code: gameData.g_code },
      { ...gameData, category_name: category_name },
      { upsert: true, new: true }
    );
  }


  console.log("Added :", newGame);


  return { newGame, category };
}

const fetchGamesFromApi = async (result, category_name) => {
  console.log("Signature:", result.operatorcode, result.providercode, result.key);
  try {
    const operatorcode = result.operatorcode;
    const providercode = result.providercode;
    const secret_key = result.key; // Replace with actual secret key

    console.log("Signature:", operatorcode, providercode, secret_key);
    const signature = crypto
      .createHash("md5")
      .update(operatorcode.toLowerCase() + providercode.toUpperCase() + secret_key)
      .digest("hex")
      .toUpperCase();


    console.log("Signature:", signature);

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

    // console.log("Fetched Games:", response);

    const gameData = JSON.parse(response.data?.gamelist);
    // console.log("Fetched Games:", gameData.length);

    let gameResults = [];

    for (let game of gameData) {
      const addedGame = await addGameWithCategory(game, category_name);
      gameResults.push(addedGame);
    }
    // await addGameWithCategory(gameData, category_name);
    // console.log("Added Games:", gameResults.length);
    return gameResults;
  } catch (error) {
    console.error("Error fetching games:", error.message);
    return [];
  }
};





exports.CasinoItemAdd = async (req, res) => {

  console.log(req.body);
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
      category_name
    } = req.body;
    let image_url = req.body.image_url;

  

    const updateData = {
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
      updatetimestamp: Date.now(),

    };
    console.log("Update Data:",updateData);

    let result;
    if (company) {
      
      result = await BetProviderTable.findOneAndUpdate(
        { company },
      updateData,
        { new: true, upsert: true }
      );
      console.log("meet:",result)
    } else {
      result = await BetProviderTable.create(updateData);
      console.log("meet: 1",result)
    }
    const NewResult = await fetchGamesFromApi(result, category_name);
    console.log(NewResult);


    res.json({ success: true, data: NewResult });
  } catch (error) {
    console.error("Error adding casino item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}








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
        $match: { categoryId: { $in: categoryId } ,p_type: {$in:p_type}},
        
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
        console.log("Unique Providers:", uniqueProviders);

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
console.log("Games:", categoriesWithGamesAndProviders);
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
    const { p_type } = req.body; // Destructure from body
    console.log("Deleting games with p_type:", p_type);

    const result = await GameListTable.deleteMany({ p_type: p_type });

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



exports.getCategoriesWithProvidersGameList = async (req, res) => {
  try {
    const { provider, category, p_type, page = 1 } = req.query;

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }

    const limit = 24;
    const skip = (page - 1) * limit;

    const categoryData = await Category.findOne({ category_name: category });
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }

    const query = {
      p_code: provider,
      p_type: p_type,
      category_name: category,
      is_active: true,
    };

    const games = await GameListTable.find(query)
      .sort({ serial_number: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameListTable.countDocuments(query);

    res.json({
      success: true,
      data: games,
      pagination: {
        page: parseInt(page),
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
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
