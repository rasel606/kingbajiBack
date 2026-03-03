


const GameListTable = require("../Models/GameListTable");


const Category = require("../Models/Category");

// নির্দিষ্ট ক্যাটাগরিতে গেম যোগ করা
// router.post("/assign-category", 
    
// exports.assignCategory = async (req, res) => {
//   try {
//     const { gameId, categoryId } = req.body;
// // console.log(gameId,categoryId)
//     // গেম এবং ক্যাটাগরি খুঁজে বের করুন
//     const game = await GameListTable.findOne({g_code:gameId});
//     const Category = await Category.findOne({Categoryname:categoryId});
//     // console.log(game,category)
//     if (!game) {
//       return res.status(404).json({ message: "Game or category not found" });
//     }

//     // গেম আপডেট করুন
//     game.Categoryname = categoryId;
//     await game.save();
//     console.log(game)
//     // ক্যাটাগরিতে গেম যোগ করুন
//     if (!Category.games.includes(gameId)) {
//         Category.gameId
//       .push(gameId);
//       await Category.save();
      
//     }
//     console.log(Category)
//     res.status(200).json({ message: "Game assigned to category successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "server error", error });
//   }
// }

exports.assignCategory = async (req, res) => {
  try {
    const { gameId, categoryId } = req.body;

    const game = await GameListTable.findOne({ g_code: gameId });
    const category = await Category.findOne({ category_name: categoryId });

    // if (!game) {
    //   return res.status(404).json({ message: "Game or category not found" });
    // }

    // Update the game with the category
    game.category_name = categoryId;
    await game.save();

    // Check if the category has the gameId (g_code), or create it if not
    const cate = await Category.findOne({ category_name: categoryId });

    if (!cate) {
      // If category not found, create a new category with the game
      const newCategory = await Category.create({
        category_name: categoryId,
        g_code: [gameId] // Assuming g_code is an array
      });
      console.log("Created new category:", newCategory);
      return res.status(200).json({ message: "New category created and game assigned.", cate: newCategory });
    }

    // If category found, update it with the new gameId
    if (!cate.g_code.includes(gameId)) {
      cate.g_code.push(gameId);
      await cate.save();
    }

    res.status(200).json({ message: "Game assigned to category successfully", cate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



// router.get("/categories", 
    
    exports.GetFontCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  }
  
//   router.get("/games", 
    
    exports.GetFontGames = async (req, res) => {
    try {
      const games = await GameListTable.find().populate("provider");
      res.status(200).json(games);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  }
  