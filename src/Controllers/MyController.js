const axios = require('axios');
const Category  = require('../Models/Category');
const Games  = require('../Models/Games');







// Add game with category
async function addGameWithCategory(gameData, categoryName) {
  console.log("line-3", gameData);

  let category = await Category.findOne({ name: categoryName });
  if (!category) {
      category = new Category({ name: categoryName, description: 'Slot games category' });
      await category.save();
  }

  const newGame = new Games({ ...gameData, category: category._id });
  await newGame.save();
  console.log('Game added with category:', newGame);
}



  // exporsts.addGameWithCategory= async (gameData, categoryName)=> {
  //   let category = await Category.findOne({ name: categoryName });
  //   if (!category) {
  //     category = new Category({ name: categoryName, description: 'Category description' });
  //     await category.save();
  //   }
  
  //   const newGame = new Game({
  //     ...gameData,
  //     category: category._id
  //   });
  
  //   await newGame.save();
  // }
  
 // app.get('/fetch-games'





    exports.fetchGamesFromApi = async (req, res)=> {
      try {
        const response = await axios.get('https://gsmd.336699bet.com/getGameList.ashx', {
            params: {
                operatorcode: 'je1b',
                providercode: 'JD',
                lang: 'en',
                html: '0',
                reformatjson: 'yes',
                signature: '1861107AC45DD0DC757EA0A7ED8E8EF1'
            }
        });
        
        const gameData = JSON.parse (response.data?.gamelist);
        // console.log("line-1", gameData);
        for (let game of gameData) {
          console.log("line-2", gameData);
            await addGameWithCategory(game, 'slots');
        }

        res.status(200).json({ message: 'Games fetched and added successfully', gameData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching games from API' });
    }
        
}




// app.get('/games/:category',
    
  //   exports.getGamesByCategory = async (req, res) => {
  //   const { category } = req.params;
  
  //   try {
  //     const games = await Game.aggregate([
  //       { $match: { 'category.name': category } },
  //       { $lookup: {
  //           from: 'categories',
  //           localField: 'category',
  //           foreignField: '_id',
  //           as: 'category_info'
  //         }
  //       },
  //       { $unwind: '$category_info' },
  //       { $project: {
  //           g_code: 1,
  //           gameName: 1,
  //           imgFileName: 1,
  //           'category_info.name': 1
  //         }
  //       }
  //     ]);
  
  //     res.status(200).json(games);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Error fetching games' });
  //   }
  // }
  

//   app.post('/add-game', 
    
   exports.addGame = async (req, res) => {
    const { gameData, categoryName } = req.body;
  
    try {
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = new Category({ name: categoryName, description: 'Category description' });
        await category.save();
      }
  
      const newGame = new Game({
        ...gameData,
        category: category._id
      });
  
      await newGame.save();
      res.status(201).json({ message: 'Game added successfully', game: newGame });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding game' });
    }
  }



  const generateSignature = (operatorCode, secretKey) => {
    return md5(operatorCode + secretKey).toUpperCase();
  }
  exports.getDailyWager = async (req, res) => {
    try {
      const { dateF, dateT,operatorCode,secretKey, providercode } = req.query;
  
      if (!dateF || !dateT || !providercode) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
  
      const signature = generateSignature(secretKey, providercode);
  
      const apiUrl = `${"http://fetch.336699bet.com"}/getDailyWager.ashx?operatorcode=${operatorCode}&dateF=${dateF}&dateT=${dateT}&providercode=${providercode}&signature=${signature}`;
  
      const response = await axios.get(apiUrl);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching wager data:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };