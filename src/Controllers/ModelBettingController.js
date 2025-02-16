const express = require("express");
const crypto = require("crypto");





const BetProviderTable = require("../Models/BetProviderTable");
const Casino_category_table = require("../Models/Casino_category_table");
const GameTypeList = require("../Models/GameTypeTable");
const GameListTable = require("../Models/GameListTable");
const SportsCategoryTable = require("../Models/SportsCategoryTable");
const AdminController = require("../Controllers/AdminController");
const BettingTable = require("../Models/BettingTable");
const { userbet } = require("./CornController");
const BetHistoryTable = require("../Models/BetHistoryTable");
const CasinoItemTable = require("../Models/Casino_item_table");
const User = require("../Models/User");
const WidthrowTableHistory = require("../Models/WidthrowTableHistory");
const { default: axios } = require("axios");
const { refreshBalance } = require("./Refresh_blance");
const gameTable = require("../Models/GamesTable");




// Odds sync route
exports.OddSync = async (req, res) => {
  try {
    const apiUrl = 'https://api.the-odds-api.com/v4/sports/';
    const apiKey = '8c3ea523d47df9099d369920dddd1841'; // Replace with your actual API key

    // Fetch data from the external API
    const response = await axios.get(`${apiUrl}?apiKey=${apiKey}`);
    const data = response.data;

    if (data.message) {
      return res.json({ return: false, message: data.message });
    }

    // Clear existing data in the 'SportsBet' collection (if necessary)
    await OddSportsTable.deleteMany({});

    // Process the fetched data and insert into MongoDB
    const sportsBets = data.map((value) => ({
      sports_key: value.key,
      groups: value.group,
      title: value.title,
      description: value.description,
      is_active: value.active,
      has_outrights: value.has_outrights,
      staff_id: getStaffUserId(),
      bet: bettingKeyCheck(value.key),
      datetime: new Date() // Assuming you want to set the current datetime
    }));
    // Use bulkWrite for better performance
    const bulkOps = sportsBets.map((bet) => ({
      updateOne: {
        filter: { sports_key: bet.sports_key },
        update: { $set: bet },
        upsert: true, // Insert if not found
      },
    }));

    await OddSportsTable.bulkWrite(bulkOps);

    res.json({ return: true, message: 'Sync completed successfully', output: data });
  } catch (err) {
    console.error('Error during sync:', err);
    res.status(500).json({ return: false, message: 'Internal Server Error', error: err.message });
  }
}


exports.OddsGroup = async (req, res) => {
  try {
    const results = await OddSportsTable.aggregate([
      {
        $unwind: "$groups"
      },
      {
        $group: {
          _id: "$groups",
          // bets: { $push: "$$ROOT" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



// Get all active categories ordered by name
// app.get('/categories',
exports.Category = async (req, res) => {
  try {
    const categories = await SportsCategoryTable.find({ id_active: true }).sort('name');
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.SportsBetsWithCategories = async (req, res) => {
  try {
    const results = await SportsBet.aggregate([
      {
        $lookup: {
          from: "sportscategorytables",  // The name of the SportsCategoryTable collection in the database
          localField: "sports_key",      // Field in the SportsBet collection
          foreignField: "name",          // Field in the SportsCategoryTable collection
          as: "category_info"            // Alias for the joined data
        }
      },
      {
        $unwind: {
          path: "$category_info",       // Flatten the array of joined data
          preserveNullAndEmptyArrays: true // Keep records without matching category info
        }
      },
      {
        $sort: { "datetime": 1 } // Sort by date, or any other field
      }
    ]);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//   app.post('/categories', 
//     exports.AddCetagoryForSportsCategory  = async (req, res) => {
//     try {
//       const category = new SportsCategoryTable(req.body);
//       const savedCategory = await category.save();
//       res.status(201).json(savedCategory);
//     } catch (err) {
//       res.status(400).json({ error: err.message });
//     }
//   }

// Update a category by ID
//   app.put('/categories/:id',
//     exports.UpdateSportsCategory = async (req, res) => {
//     try {
//       const updatedCategory = await SportsCategoryTable.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true }
//       );
//       if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
//       res.status(200).json(updatedCategory);
//     } catch (err) {
//       res.status(400).json({ error: err.message });
//     }
//   }

exports.Sports = async (req, res) => {

  const data = await fetchFromApi(url);
  if (!data.return) {
    return res.status(500).json(data);
  }
  res.json(data);
};




exports.getOddsSports = async (req, res) => {
  const { key } = req.params;
  const apiKey = "8c3ea523d47df9099d369920dddd1841";
  const regions = "us";
  const oddsFormat = "decimal";
  const url = `https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=${regions}&markets=h2h,spreads&oddsFormat=${oddsFormat}`;

  const data = await fetchFromApi(url);
  if (!data.return) {
    return res.status(500).json(data);
  }
  res.json(data);
};







async function addGameWithCategory(gameData, category_name) {


  let category = await Casino_category_table.findOne({ category_name });

  // if (!category) {
  //   category = new Casino_category_table.create({ category_name });

  // }

  let newGame;
  if (!category) {
    newGame = await GameListTable.create(
      // Assuming `game_id` is unique
      { ...gameData, category_name },

    );
  } else {
    newGame = await GameListTable.findOneAndUpdate(
      // Assuming `game_id` is unique
      { g_code: gameData.g_code },
      { ...gameData, category_name: category_name },
      { upsert: true, new: true }
    );
  }


  console.log("Added :", newGame);


  return { newGame, category };
}

const fetchGamesFromApi = async (result, category_name) => {
  try {
    const operatorcode = result.operatorcode;
    const providercode = result.providercode;
    const secret_key = result.key; // Replace with actual secret key

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

    // Upload image to ImageBB if provided
    if (req.file) {
      const imageData = req.file.buffer.toString("base64");
      const response = await axios.post("https://api.imgbb.com/1/upload", null, {
        params: { key: IMAGEBB_API_KEY, image: imageData },
      });
      image_url = response.data.data.url;
    }

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

    let result;
    if (company) {
      result = await BetProviderTable.findOneAndUpdate(
        { company },
        updateData,
        { new: true, upsert: true }
      );
    } else {
      result = await BetProviderTable.create(updateData);
    }
    const NewResult = await fetchGamesFromApi(result, category_name);
    console.log(NewResult);


    res.json({ success: true, data: NewResult });
  } catch (error) {
    console.error("Error adding casino item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}















//   try {
//     const {  company, name, url, login_url, username, password, providercode, operatorcode, key, auth_pass, currency_id } = req.body;
//     let image_url = req.body.image_url;

//     // Upload image to ImageBB if provided
//     if (req.file) {
//       const imageData = req.file.buffer.toString('base64');
//       const response = await axios.post('https://api.imgbb.com/1/upload', null, {
//         params: { key: IMAGEBB_API_KEY, image: imageData },
//       });
//       image_url = response.data.data.url;
//     }

//     // let result;
//     if (company) {
//       console.log(company, name, url, login_url, username, password, providercode, operatorcode, key, auth_pass);
//       result = await BetProviderTable.findOneAndUpdate(
//         {company:company},
//         { company, name, url, login_url, username, password, providercode, operatorcode, key, auth_pass, currency_id, image_url, updatetimestamp: Date.now() },
//         { new: true }
//       );
//       console.log("result", result);

//     } else {
//       console.log(company, name, url, login_url, username, password, providercode, operatorcode, key, auth_pass);
//       result = await BetProviderTable.create({ company, name, url, login_url, username, password, providercode, operatorcode, key, auth_pass, currency_id, image_url });

//       console.log("result", result);

//     }


//  console.log("result", result);
//     res.json({ success: true, data: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// }




// POST route to add sports
// router.post('/add-sports', 

exports.Add_Sports = async (req, res) => {
  try {
    const { key, type, category } = req.body;

    // Check if a record already exists
    const existingBetting = await BettingTable.findOne({ rel_id: key, rel_type: type });

    if (existingBetting) {
      return res.status(400).json({ message: 'Betting entry already exists.' });
    }

    // Create a new betting entry
    const newBetting = new BettingTable({
      rel_id: key,
      rel_type: type,
      staff_id: getStaffUserId(req),
      cetegory_id: category,
    });

    await newBetting.save();

    // Update odds if type matches
    if (type === 'BETTING_ODDS') {
      await mongoose.connection.db.collection('tblodds_sports').updateOne(
        { sports_key: key },
        { $set: { bet: 1 } }
      );
    }

    res.status(201).json({ message: 'Betting entry added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
}


// API to get grouped bets by 'groups' field
// app.get('/odds-groups', 


// Replace these with appropriate functions or static configurations as needed
// const getOption = (key) => {
//     const options = {
//       betting_odds_api_key: 'your_api_key_here',
//       betting_odds_region: 'us',
//       betting_odds_oddsFormat: 'decimal'
//     };
//     return options[key];
//   };

// //   app.get('/odds_sports/:key',
//     exports.OddsSportsByKey = async (req, res) => {
//     const { key } = req.params;
//     const apiKey = getOption('betting_odds_api_key');
//     const regions = getOption('betting_odds_region');
//     const oddsFormat = getOption('betting_odds_oddsFormat');

//     try {
//       const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds/`, {
//         params: {
//           apiKey,
//           regions,
//           markets: 'h2h,spreads',
//           oddsFormat
//         }
//       });

//       const output = response.data;
//       res.json({ return: true, message: 'b_sync_done', output });
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'An error occurred';
//       res.json({ return: false, message: errorMessage, output: [] });
//     }
//   }


// Update sports function route
// app.put('/update_sports/:id', 
exports.UpdateSports = async (req, res) => {
  const id = req.params.id;
  const categoryId = req.body.category_id;

  try {
    const bettingRecord = await BettingTable.findById(id);

    if (!bettingRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    bettingRecord.cetegory_id = categoryId;
    bettingRecord.updatetimestamp = Date.now();

    await bettingRecord.save();

    res.status(200).json({ message: 'Category updated successfully', bettingRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.AddSports = async (req, res) => {
  try {
    const { key, type, category } = req.body;

    // Check if the entry already exists
    const existingBet = await BettingTable.findOne({ rel_id: key, rel_type: type });

    if (existingBet) {
      return res.status(400).json({ message: 'Betting entry already exists' });
    }

    // Create new betting entry
    const newBetting = new BettingTable({
      rel_id: key,
      rel_type: type,
      staff_id: 'some_staff_id', // Replace with actual staff ID logic
      cetegory_id: category,
      // json: JSON.stringify(req.body), // Assuming you want to store the request body as a JSON string
    });

    // Save the new betting entry
    await BettingTable.save();

    // If it's a betting odds type, update the 'tblodds_sports' collection
    if (type === 'BETTING_ODDS') {
      // Assuming you have a separate model for tblodds_sports
      const tbloddsSports = await OddSportsTable.findOne({
        sports_key: key,
      })

      await tbloddsSports.updateOne({ sports_key: key }, { $set: { bet: 1 } });
    }

    return res.status(201).json({ message: 'Betting entry added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.Modal = async (req, res) => {
  const { type, id, name, description } = req.body;

  try {
    switch (type) {
      case 'BETTING_ODDS':
        const category = await AdminController.Category();
        const sports = await AdminController.getOddsSports(id);

        const betActived = await AdminController.oddsActived(id);

        return res.json({
          data: { id, category, type, name, description, sports, betActived },
          return: true,
          message: "Betting odds data retrieved successfully."
        });

      case 'viewBet':
      case 'menualBet':
        const sport = await BettingTable.findById(id);
        return res.json({
          data: sport,
          return: true,
          message: "Bet details retrieved."
        });

      case 'winLoss':
        const userBetData = await userbet(req.body);
        return res.json({
          data: userBetData,
          return: true,
          message: "Win/Loss data retrieved."
        });

      default:
        return res.json({ return: false, message: "Invalid request type.", data: [] });
    }
  } catch (error) {
    return res.status(500).json({ return: false, message: "Server error", error: error.message });
  }
}







exports.Apply = async (req, res) => {
  try {
    const { win, name, bet_name } = req.body;
    const winLossStatus = win === "true" ? 1 : 2;

    const updatedBet = await BetHistoryTable.findOneAndUpdate(
      { bet_name: bet_name },
      { user_id: name },
      { bet_win: winLossStatus },
      { new: true } // return the updated document
    );

    if (updatedBet) {
      res.status(200).json({ return: true, message: 'Bet status successfully updated.' });
    } else {
      res.status(404).json({ return: false, message: 'Bet not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ return: false, message: 'Internal server error.' });
  }
}








// ImgBB API configuration
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
const IMGBB_URL = 'https://api.imgbb.com/1/upload';

// Function to upload image to ImgBB
async function uploadImageToImgBB(file) {
  const formData = new FormData();
  formData.append('image', file.buffer.toString('base64'));

  try {
    const response = await axios.post(IMGBB_URL, formData, {
      params: { key: IMGBB_API_KEY },
    });
    return response.data.data.url; // Returns the URL of the uploaded image
  } catch (error) {
    throw new Error('Image upload failed');
  }
}


// Route to add or update a category (similar to the PHP function)
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
      const categoryToUpdate = await SportsCategoryTable.findById(id);
      if (!categoryToUpdate) {
        return res.status(404).json({ message: 'Category not found' });
      }

      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
        data.image = imageUrl;
      }

      await OddSportsTable.findByIdAndUpdate(id, data, { new: true });
      return res.status(200).json({ message: 'Category updated successfully' });
    } else {
      // Create new category
      const newCategory = new SportsCategoryTable(data);
      await newCategory.save();
      return res.status(201).json({ message: 'Category added successfully', category: newCategory });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.UpdateStatus = async (req, res) => {
  const { id, status } = req.body;

  try {
    const result = await BettingTable.findByIdAndUpdate(id, {
      id_active: status !== 'true',
    });

    if (result) {
      return res.json({ message: 'Update successful' });
    }
    res.status(404).json({ error: 'Game not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// router.post('/update-status',

exports.UpdateGameTypeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || typeof status === 'undefined') {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const updatedGameType = await GameTypeList.findByIdAndUpdate(
      id,
      { is_active: status === 'checked' ? false : true, updatetimestamp: Date.now() },
      { new: true }
    );

    if (!updatedGameType) {
      return res.status(404).json({ message: 'Game Type not found' });
    }

    res.json({ message: 'Update successful', data: updatedGameType });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.UpdateBetProvider = async (req, res) => {
  const { id, ...data } = req.body;

  try {
    if (req.file) {
      // Upload image to ImgBB
      const formData = new FormData();
      formData.append('image', req.file.buffer, req.file.originalname);

      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          key: 'YOUR_IMGBB_API_KEY', // Replace with your ImgBB API key
        },
      });

      // Get the URL of the uploaded image
      data.image_url = response.data.data.url;
    }

    if (id) {
      const existingProvider = await BetProvider.findById(id);
      if (existingProvider && existingProvider.image_url) {
        // Here we no longer need to delete old image from local storage
        // ImgBB handles the image storage online
        const updatedProvider = await BetProvider.findByIdAndUpdate(id, data, { new: true });
        return res.json(updatedProvider);
      }
      const updatedProvider = await BetProvider.findByIdAndUpdate(id, data, { new: true });
      return res.json(updatedProvider);
    } else {
      const newProvider = new BetProvider(data);
      await newProvider.save();
      res.status(201).json(newProvider);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const uploadToImageBB = async (filePath) => {
  const apiKey = 'YOUR_IMAGEBB_API_KEY';
  const formData = new FormData();
  formData.append('image', fs.createReadStream(filePath));

  const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      key: apiKey,
    },
  });

  return response.data.data.url; // The URL of the uploaded image
};


//   router.get('/odds_betting/:id',

exports.OddsBetting = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const bets = await BettingTable.find({ cetegory_id: categoryId });

    let output = [];

    for (const bet of bets) {
      const dt = await OddsSportsTable(bet.rel_id);
      if (dt.return) {
        const sports = await SportsTable.findOne({ sports_key: bet.rel_id });
        output.push({ sports, bet: dt.output });
      }
    }

    res.json(output);
  } catch (error) {
    console.error('Error fetching betting odds:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



// API route to get all casino categories
exports.GetCasinoCategory = async (req, res) => {
  try {
    const categories = await CasinoCategoryTable.find(); // Fetch all casino categories
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching casino categories', error });
  }
}
// Route to handle file upload and update
exports.CasinoUpdate = async (req, res) => {
  const { c_id, category_name, link, is_active } = req.body;
  const images = ['casino_logo_1', 'casino_logo_2', 'casino_logo_3', 'casino_logo_4', 'casino_logo_5', 'casino_logo_6'];

  let updateData = { c_id, category_name, link, is_active, updatetimestamp: new Date() };

  for (const imageField of images) {
    if (req.files[imageField]) {
      try {
        const filePath = req.files[imageField][0].path;
        const imageURL = await uploadToImageBB(filePath); // Upload to ImageBB
        updateData[imageField] = imageURL; // Add image URL to update data
        fs.unlinkSync(filePath); // Delete the temporary file
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).send({ error: 'Image upload failed' });
      }
    }
  }

  try {
    const updatedCategory = await GameTypeList.findOneAndUpdate({ c_id }, updateData, { new: true });
    if (!updatedCategory) {
      return res.status(404).send({ error: 'Casino category not found' });
    }
    return res.status(200).send(updatedCategory);
  } catch (error) {
    console.error('Error updating casino category:', error);
    return res.status(500).send({ error: 'Update failed' });
  }
}


//app.get('/api/games/:id',
exports.ShowGameListById = async (req, res) => {
  try {
    const gameId = req.params.id;


    // Find the game based on g_code
    const game = await GameListTable.findOne({ g_code: gameId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Server error" });
  }
};






//app.get('/api/games/:id',
exports.GetGameList = async (req, res) => {
  try {
    const game = await GameListTable.find()

    // .populate('category_id', 'category_name');
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}


exports.UpdateGameType = async (req, res) => {
  try {
    const { id, ...data } = req.body;

    if (req.file) {
      const filePath = req.files[imageField][0].path;
      const imageURL = await uploadToImageBB(filePath); // Upload to ImageBB
      updateData[imageField] = imageURL;
      data.image_url = imageURL;
    }

    let result;
    if (id) {
      result = await BetProviderTable.findByIdAndUpdate(id, data, { new: true });
    } else {
      result = await new BetProviderTable(data).save();
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



exports.UpdateStatusProvider = async (req, res) => {
  const { id, status } = req.body;

  try {
    const result = await BetProviderTable.findByIdAndUpdate(id, {
      is_active: status !== 'checked',
    });

    if (result) {
      return res.json({ message: 'Update successful' });
    }
    res.status(404).json({ error: 'Provider not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}





exports.Casino_Category = async (req, res) => {
  const { category_id, category_name, category_code, order_by } = req.body;
  const file = req.file;

  // Prepare the data object
  const data = {
    type_name: category_name,
    type_code: category_code,
    game_is_api: 'your_value', // Add your value here
    is_active: true, // Set your condition for active status
  };

  if (file) {
    try {
      // Send file to ImageBB
      const formData = new FormData();
      formData.append('image', file.buffer, 'image.jpg');

      const response = await axios.post('https://api.imgbb.com/1/upload?key=' + imageBBApiKey, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageURL = response.data.data.url;  // The image URL from ImageBB
        data.type_image = imageURL;

        // If updating, delete old image file (in MongoDB, you can store URL, no need for local file handling)
        if (category_id) {
          const existingCategory = await GameTypeList.findById(category_id);
          if (existingCategory && existingCategory.type_image) {
            const existingImageUrl = existingCategory.type_image;
            // Optionally: Delete image from ImageBB if needed
          }
          await BetProviderTable.findByIdAndUpdate(category_id, data);
          return res.status(200).json({ message: 'Category updated successfully' });
        }
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error uploading image to ImageBB', error });
    }
  }

  // If no file, simply update DB without the image
  if (category_id === 0) {
    const newCategory = new BetProviderTable(data);
    await newCategory.save();
    return res.status(200).json({ message: 'Category saved successfully' });
  }
}








exports.GetCasinoCetegoryById = async (req, res) => {
  try {
    const result = await CasinoItem.aggregate([
      {
        $lookup: {
          from: 'casinocategories', // MongoDB collection name (pluralized by Mongoose)
          localField: 'category_id',
          foreignField: 'c_id',
          as: 'category_details',
        },
      },
      { $unwind: '$category_details' },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


exports.UpdateBetProvider = async (req, res) => {
  const { id, ...data } = req.body;

  try {
    if (req.file) {
      // Upload image to ImgBB
      const formData = new FormData();
      formData.append('image', req.file.buffer, req.file.originalname);

      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          key: 'YOUR_IMGBB_API_KEY', // Replace with your ImgBB API key
        },
      });

      // Get the URL of the uploaded image
      data.image_url = response.data.data.url;
    }

    if (id) {
      const existingProvider = await BetProvider.findById(id);
      if (existingProvider && existingProvider.image_url) {
        // Here we no longer need to delete old image from local storage
        // ImgBB handles the image storage online
        const updatedProvider = await BetProviderTable.findByIdAndUpdate(id, data, { new: true });
        return res.json(updatedProvider);
      }
      const updatedProvider = await BetProviderTable.findByIdAndUpdate(id, data, { new: true });
      return res.json(updatedProvider);
    } else {
      const newProvider = new BetProvider(data);
      await newProvider.save();
      res.status(201).json(newProvider);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//router.delete('/casino-category/:id',

exports.Casino_Category_Delete = async (req, res) => {
  try {
    const { id } = req.params;
    const gameType = await GameTypeList.findById(id);

    if (!gameType) {
      return res.status(404).json({ message: 'Game type not found' });
    }

    // Define the path where images are stored
    const imagePath = path.join(__dirname, '../uploads/game-type/', gameType.type_image);

    // Delete the image file if it exists
    if (gameType.type_image && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the record from MongoDB
    await GameTypeList.findByIdAndDelete(id);

    res.json({ message: 'Game type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}



exports.BetProviderDelete = async (req, res) => {
  const { id } = req.params;

  try {
    const provider = await BetProviderTable.findById(id);

    await BetProviderTable.findByIdAndDelete(id);
    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


//router.post('/casino_item_add', upload.single('image'), 





// router.post('/game/update',

exports.UpdateGame = async (req, res) => {
  try {
    const { id, game_name, game_Id, game_type, category_id, agent_Id, is_hot } = req.body;
    let imageUrl = null;

    // Handle Image Upload to ImageBB
    if (req.file) {
      const imageData = req.file.buffer.toString('base64');
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, {
        image: imageData,
      });
      imageUrl = response.data.data.url;
    }

    // Data Object for Update
    const gameData = {
      game_name,
      game_Id,
      game_type,
      category_id,
      agent_Id,
      is_hot: is_hot ? true : false,
    };

    // Add image_url if an image was uploaded
    if (imageUrl) {
      gameData.image_url = imageUrl;
    }

    let result;
    if (id === '0') {
      result = await GameListTable.create(gameData);
    } else {
      result = await GameListTable.findByIdAndUpdate(id, gameData, { new: true });
    }

    res.json({ return: true, message: 'Update Successful', data: result });
  } catch (error) {
    res.status(500).json({ return: false, message: 'Something went wrong', error: error.message });
  }
}

// DELETE Casino Item
// router.delete("/:id", 
exports.DeleteCasinoItem = async (req, res) => {
  try {
    const { id } = req.params;
    const casinoItem = await CasinoItemTable.findById(id);

    if (!casinoItem) {
      return res.status(404).json({ error: "Casino item not found" });
    }

    // Extract ImageBB URL
    const imageUrl = casinoItem.image;

    // Delete image from ImageBB (if exists)
    if (imageUrl) {
      try {
        await axios.delete(`https://api.imgbb.com/1/delete`, {
          params: { key: IMAGEBB_API_KEY, image_url: imageUrl },
        });
      } catch (error) {
        console.error("Error deleting image from ImageBB:", error);
      }
    }

    // Delete item from database
    await CasinoItemTable.findByIdAndDelete(id);
    res.json({ message: "Casino item deleted successfully" });
  } catch (error) {
    console.error("Error deleting casino item:", error);
    res.status(500).json({ error: "Server error" });
  }
}


//router.post('/add_manual',
exports.AddManual = async (req, res) => {
  try {
    const { id, sports_id, sports_key, title, name, price, image } = req.body;

    let betting = await BettingTable.findById(id);
    if (!betting) {
      return res.status(404).json({ success: false, message: 'Betting entry not found' });
    }

    let manual = betting.manual ? JSON.parse(betting.manual) : [];
    let sportIndex = manual.findIndex(item => item.id === sports_id);

    if (sportIndex !== -1) {
      let bookmakers = manual[sportIndex].bookmakers || [];
      let bookIndex = bookmakers.findIndex(b => b.title === title);

      if (bookIndex !== -1) {
        bookmakers[bookIndex].markets.push({ name, price });
      } else {
        bookmakers.push({
          title,
          markets: [{ name, price }]
        });
      }
      manual[sportIndex].bookmakers = bookmakers;
    } else {
      manual.push({
        id: sports_id,
        sport_key: sports_key,
        bookmakers: [{
          title,
          markets: [{ name, price }]
        }]
      });
    }

    // Upload image to ImageBB if provided
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', formData);
      imageUrl = imgbbResponse.data.data.url;
    }

    betting.manual = JSON.stringify(manual);
    await betting.save();

    res.json({ success: true, message: 'Manual betting updated', imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


// Route to handle the delete request
//router.post('/delete', 
exports.DeleteManual = async (req, res) => {
  const { type, data } = req.body; // Get data from request body

  try {
    const bettingEntry = await BettingTable.findOne({ _id: data.sports_id });

    if (!bettingEntry) {
      return res.status(404).json({ message: 'Betting entry not found' });
    }

    // Parse the manual field (JSON string)
    let manual = bettingEntry.manual ? JSON.parse(bettingEntry.manual) : null;

    if (manual && manual.length > 0) {
      const { main_id, bookmark_id, market_id } = data;

      if (type === 'bookmark') {
        // Remove bookmark
        if (manual[main_id] && manual[main_id].bookmakers[bookmark_id]) {
          delete manual[main_id].bookmakers[bookmark_id];
          bettingEntry.manual = JSON.stringify(manual);
          await bettingEntry.save();
          return res.json({ return: true });
        }
      } else if (type === 'market') {
        // Remove market
        if (manual[main_id] && manual[main_id].bookmakers[bookmark_id]) {
          delete manual[main_id].bookmakers[bookmark_id].markets[market_id];
          bettingEntry.manual = JSON.stringify(manual);
          await bettingEntry.save();
          return res.json({ return: true });
        }
      } else {
        return res.status(400).json({ return: false });
      }
    } else {
      return res.status(400).json({ return: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}


// Edit Betting Table Data
//router.post('/edit',
exports.EditManual = async (req, res) => {
  const { type, data } = req.body;
  const { sports_id, main_id, bookmark_id, market_id, name } = data;

  try {
    // Find the sports entry by sports_id
    const bettingTable = await BettingTable.findById(sports_id);
    if (!bettingTable) {
      return res.status(404).json({ return: false, message: 'Betting table not found' });
    }

    // Parse manual JSON if it's not empty
    if (bettingTable.manual && bettingTable.manual.length > 0) {
      let manual = JSON.parse(bettingTable.manual);

      switch (type) {
        case 'bookmark':
          if (manual[main_id]?.bookmakers[bookmark_id]) {
            manual[main_id].bookmakers[bookmark_id].title = name;
            bettingTable.manual = JSON.stringify(manual);
            await bettingTable.save();
            return res.json({ return: true });
          }
          break;

        case 'market':
          if (manual[main_id]?.bookmakers[bookmark_id]?.markets[market_id]) {
            manual[main_id].bookmakers[bookmark_id].markets[market_id].name = name;
            bettingTable.manual = JSON.stringify(manual);
            await bettingTable.save();
            return res.json({ return: true });
          }
          break;

        case 'market_price':
          if (manual[main_id]?.bookmakers[bookmark_id]?.markets[market_id]) {
            manual[main_id].bookmakers[bookmark_id].markets[market_id].price = name;
            bettingTable.manual = JSON.stringify(manual);
            await bettingTable.save();
            return res.json({ return: true });
          }
          break;

        default:
          return res.json({ return: false });
      }
    } else {
      return res.json({ return: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ return: false, message: 'Server Error' });
  }
}


// Function to get bet price
exports.BetPrice = async (req, res) => {
  try {
    const { sport_key, bet_type, bet_key, bet_name, sport_id } = req.body;
    const bet = await BettingTable.findOne({ rel_id: sport_key });

    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    let price = null;

    if (bet_type === 'auto') {
      if (bet.history) {
        const history = JSON.parse(bet.history);
        if (history.output && history.output.data) {
          const data = history.output.data;
          for (const value of data) {
            if (value.bookmakers) {
              for (const bookmaker of value.bookmakers) {
                if (bookmaker.key === bet_key) {
                  for (const market of bookmaker.markets) {
                    for (const outcome of market.outcomes) {
                      if (outcome.name === bet_name) {
                        price = outcome.price;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (bet_type === 'manual') {
      if (bet.manual) {
        const manual = JSON.parse(bet.manual);
        for (const value of manual) {
          if (value.id === sport_id) {
            if (value.bookmakers) {
              for (const bookmaker of value.bookmakers) {
                for (const market of bookmaker.markets) {
                  if (market.name === bet_name) {
                    price = market.price;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (price !== null) {
      return res.json({ price });
    } else {
      return res.status(404).json({ error: 'Price not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


//app.post('/api/deposit/accept', 

exports.acceptDeposit = async (req, res) => {
  const { deposit_id } = req.body;

  try {
    // Find the deposit with status '0' (Hold)
    const deposit = await Deposit.findOne({
      deposit_id,
      status: 0,
    });

    if (!deposit) {
      return res.status(404).json({
        return: false,
        message: 'Deposit not found or already accepted',
      });
    }

    // Update the user's balance
    const user = await User.findById(deposit.deposit_user_id);
    if (!user) {
      return res.status(404).json({
        return: false,
        message: 'User not found',
      });
    }

    user.balance += deposit.amount;
    await user.save();

    // Update the deposit status to '1' (Accepted)
    deposit.status = 1;
    await deposit.save();

    return res.json({
      return: true,
      message: 'Deposit accepted and user balance updated successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      return: false,
      message: 'Something went wrong',
    });
  }
}

//app.get('/api/withdraw',
exports.Users_withdraw = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);  // Send user data to frontend
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
}






// Withdraw Accept
//router.post('/withdraw_accept', 
exports.withdraw_accept = async (req, res) => {
  const { id, trans_id } = req.body;

  try {
    const transaction = await WidthrowTableHistory.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 1; // Accept
    if (trans_id) transaction.transactionID = trans_id;

    await transaction.save();

    res.json({ success: true, message: 'Update successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// Withdraw Reject
//router.post('/withdraw_reject', 

exports.withdraw_reject = async (req, res) => {
  const { id } = req.body;

  try {
    const transaction = await WidthrowTableHistory.findOne({ _id: id, status: 0 });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or already processed' });
    }

    // Assuming you have a User model to handle user balances
    const user = await User.findById(transaction.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance += transaction.amount; // Revert balance
    await user.save();

    transaction.status = 2; // Reject
    await transaction.save();

    res.json({ success: true, message: 'Withdrawal rejected and balance restored' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}


// router.get("/sports-list",
exports.Sports_list = async (req, res) => {
  try {
    const mode = req.query.mode || "In-Play";
    const categoryId = req.query.category_id || 0;

    let query = { id_active: true };
    if (categoryId != 0) {
      query._id = categoryId;
    }

    const categories = await SportsCategoryTable.find(query);
    let responseData = [];

    for (const category of categories) {
      const bettingRecords = await BettingTable.find({
        cetegory_id: category._id,
        is_active: true,
      });

      let number = 0;
      let categoryData = {
        categoryName: category.name,
        bets: [],
      };

      for (const record of bettingRecords) {
        if (record.json) {
          let jsonData = JSON.parse(record.json);
          if (jsonData.odds && jsonData.odds.output) {
            for (const bet of jsonData.odds.output) {
              const commenceDate = new Date(bet.commence_time);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              if ((mode === "In-Play" && commenceDate <= new Date()) ||
                (mode === "Today" && commenceDate.toDateString() === today.toDateString()) ||
                (mode === "Tomorrow" && commenceDate.toDateString() === tomorrow.toDateString()) ||
                (mode === "all")) {
                number++;
                categoryData.bets.push({
                  number,
                  sportTitle: bet.sport_title,
                  mode,
                  commenceTime: bet.commence_time,
                  awayTeam: bet.away_team,
                  homeTeam: bet.home_team,
                  betId: bet.id,
                  sportKey: bet.sport_key,
                  recordId: record._id,
                });
              }
            }
          }
        }
      }
      responseData.push(categoryData);
    }
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



/*  exports.syncCasinoInfo = async(id)=> {




   const { id } = req.body;
   try {
     const provider = await betproviderList.findOne({ is_active: true, _id: id });
 
     if (!provider) {
       return { err: true, message: 'No provider found.' };
     }
 
     // Mark as syncing
     await betproviderList.updateOne({ _id: id }, { is_sync: true });
 
     // Make API call to fetch the game list
     const signature = Buffer.from(provider.opcode.toLowerCase() + provider.provider.toUpperCase() + provider.key).toString('hex').toUpperCase();
     const response = await axios.get('https://api.example.com/getGameList.ashx', {
       params: {
         operatorcode: provider.opcode,
         providercode: provider.provider,
         lang: 'en',
         html: 1,
         reformatjson: 'yes',
         signature,
       },
     });
 
     if (!response.data || response.data.errCode !== 0) {
       return { err: true, message: response.data ? 'Game list not found' : 'Failed to load API' };
     }
 
     const gameList = response.data.gamelist;
     let updateCount = 0;
 
     for (const item of gameList) {
       let categoryId = null;
       const gameCode = item.g_code;
       const categoryCode = item.p_type.toUpperCase();
 
       let category = await GameTypeTable.findOne({ type_code: categoryCode });
 
       if (!category) {
         category = new GameTypeTable({
           type_name: item.g_type,
           type_code: categoryCode,
           is_active: true,
         });
         await category.save();
         categoryId = category._id;
       }
 
       let game = await GameListTable.findOne({ game_id: gameCode, agent_id: provider._id });
 
       if (!game) {
         const imageUrl = await uploadImageToImageBB(item.imgFileName);
         const newGame = new GameListTable({
           game_name: item.gameName.gameName_enus.toUpperCase(),
           game_Id: gameCode,
           game_type: categoryCode,
           agent_Id: provider._id,
           category_id: categoryId,
           image_url: imageUrl,
           is_active: true,
         });
         await newGame.save();
         updateCount++;
       } else if (!game.image_url) {
         const imageUrl = await uploadImageToImageBB(item.imgFileName);
         game.image_url = imageUrl;
         await game.save();
       }
     }
 
     // Update provider sync status
     await BetProviderTable.updateOne({ _id: id }, { is_sync: false });
 
     return { err: false, message: updateCount > 0 ? `${updateCount} games added.` : 'No new games to add.' };
   } catch (err) {
     return { err: true, message: 'Error syncing casino info: ' + err.message };
   }
 } */




// Launch game API
// router.post("/launch_game",
const fetchApi = async (endpoint, data = {}) => {
  try {
    const baseURL = "http://fetch.336699bet.com/"; // Replace with actual API base URL
    const url = `${baseURL}${endpoint}`;

    const config = {
      method: "GET", // Default: POST
      url,
      timeout: 10000, // 10 seconds timeout
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",

      },
    };

    if (config.method === "POST") {
      config.data = data;
    } else {
      config.params = data;
    }

    const response = await axios(config);

    
    return response.data
    // 
  } catch (error) {
    console.error("API Request Failed:", error.message);
    return { errCode: 3, errMsg: "Network or API Error" };
  }
};




const BetrefreshBalance = async (req, res) => {
  console.log(req)
  try {
      const {userId,agentID} = req.body;
      if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

      const user = await User.findOne({userId: userId});
      if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });
      // console.log("user",user)
      let balance = user.balance;
      const game = await gameTable.findOne({ userId:user.userId, status: 0,agentID, betAmount: { $gt: 0 } });
      console.log("game",game)

      if (game === null) return res.json({ errCode: 0, errMsg: 'Success', balance });
      
      const transId = crypto.randomUUID();
      const agent = await BetProviderTable.findOne(game.agentId);
      console.log(agent)
      if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

      const amount = await fetchBalance(agent, user.userId);

      console.log("amount",amount)
      if (amount > 0) {
          const signature = crypto.createHash('md5').update(
              `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
          ).digest('hex').toUpperCase();

          const refund = await fetch('http://fetch.336699bet.com/makeTransfer.aspx', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  operatorcode: agent.opcode,
                  providercode: agent.provider,
                  username: user.userId,
                  password: agent.pass,
                  referenceid: transId,
                  type: 1,
                  amount,
                  signature
              })
          });

          const refundData = await refund.json();

          console.log(refundData)
          if (!refundData || refundData.errCode !== 0) {
              return res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
          }
      }

      balance += amount;

      console.log("amount", amount)
      const win = amount - game.betAmount;

      if (win === 0) {

          console.log(win === 0)
          await gameTable.findOneAndDelete(game.gameId);

          
      } else {

          console.log( win < 0 ? 2 : 1)
          await gameTable.findOneAndUpdate(game.gameId, {
              winAmount: win,
              returnId: transId,
              status: win < 0 ? 2 : 1
          });
          const usBalance = await User.gameTable.aggregate([
            {
              $match: { last_game_id: game_id }
            },
            {
              $lookup: {
                from: "user",
                localField: "betAmount",
                foreignField: "balance",
                as: "blance"
              }
            },
            
          ]);;
          
      }

      

      res.json({ errCode: 0, errMsg: 'Success', balance });
  } catch (error) {
      console.error(error);
      res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error' });
  }
}




exports.launchGame = async (req, res) => {
  try {
    // Check if user is logged in
    // if (!req.user) {
    //     return res.json({ login: true });
    // }

    const { userId, game_id, is_demo, newProvider } = req.body;
    const user = await User.findOne({ userId });
    console.log(user)
    if (!user) {
      return res.status(400).json({ errCode: 1, errMsg: "User not found." });
    }

    let amount = user.balance;
    console.log("amount", amount)
    // Refresh balance if last game exists

    const agent = await GameListTable.aggregate([
      {
        $match: { g_code: game_id, }
      },
      {
        $lookup: {
          from: "betprovidertables",
          localField: "p_code",
          foreignField: "providercode",
          as: "provider"
        }
      },
      { $unwind: "$provider" },
      {
        $project: {
          // id: "$provider._id",
          providercode: "$provider.providercode",
          operatorcode: "$provider.operatorcode",
          key: "$provider.key",
          auth_pass: "$provider.auth_pass",
          game_type: "$p_type"
        }
      }
    ]);



    console.log("agent", agent)
    
    if (!user) {

     
      const resBalance = await refreshBalance({ userId: user.userId,agent });
      console.log("resBalance", resBalance)
      if (!resBalance || resBalance.errCode !== 0) {
        return res.json(resBalance);
      }
      amount += resBalance.balance || 0;

      // console.log("amount-3", amount)
    }
    
    // Insufficient balance check
    if (amount < 1) {
      return res.json({ errCode: 2, errMsg: "Insufficient balance." });
    }

    // Fetch game and provider details using aggregation
    

    

    if (!agent || agent.length === 0) {
      return res.json({ errCode: 1, errMsg: "Agent not found." });
    }

    const provider = agent[0]
    

    console.log("provider", provider);
    let game_url;


    const signature = generateSignature(
      provider.operatorcode,
      provider.auth_pass,
      provider.providercode,
      provider.game_type,
      user.userId,
      provider.key

    )
    const field = {
      operatorcode: provider.operatorcode,
      providercode: provider.providercode,
      username: user.userId,
      password: provider.auth_pass,
      type: provider.game_type,
      gameid: game_id,
      lang: "en-US",
      html5: 1,
      signature: signature
    };

    // console.log("field - All", field);



    if (!is_demo) {
      // Generate transaction ID
      const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 20);


      const signature = generateSignature(
        amount.toString(),
        provider.operatorcode,
        provider.auth_pass,
        provider.providercode,
        transId,
        0,
        user.userId,
        provider.key

      )
      console.log("signature", signature);
      // Make transfer API call
      const transferResponse = await fetchApi("makeTransfer.aspx", {
        operatorcode: provider.operatorcode,
        providercode: provider.providercode,
        username: user.userId,
        password: provider.auth_pass,
        referenceid: transId,
        type: 0,
        amount: amount,
        signature: signature
      });


      
      console.log("transferResponse", transferResponse);

      if (!transferResponse || transferResponse.errCode !== "0") {

        return res.json({ errCode: 2, errMsg: "Failed to load balance." });
      }

      // Insert game transaction
      await gameTable.create({
        userId: user.userId,
        agentId: provider.providercode,
        gameId: game_id,
        currencyId: user.currencyId,
        betAmount: amount,
        transactionId: transId
      });

      // Update user balance
      await User.updateOne(
        { userId: user.userId },
        { balance: 0, last_game_id: game_id }
      );

      const signatureLunchGame = generateSignature(
        provider.operatorcode,
        provider.auth_pass,
        provider.providercode,
        provider.game_type,
        user.userId,
        provider.key

      )
      const field = {
        operatorcode: provider.operatorcode,
        providercode: provider.providercode,
        username: user.userId,
        password: provider.auth_pass,
        type: provider.game_type,
        gameid: game_id,
        lang: "en-US",
        html5: 1,
        signature: signatureLunchGame
      };
      console.log("field:", field);



      game_url = await fetchApi("launchGames.aspx", field);
      console.log("game_url:", game_url);
    } else {
      game_url = await fetchApi("launchDGames.ashx", field);
      console.log(game_url)
    }

    return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });
  } catch (error) {
    console.error("Launch Game Error:", error);
    res.status(500).json({ errCode: 500, errMsg: "Server error." });
  }
}

// Generate a random string for transaction ID
function randomStr() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Generate API signature
function generateSignature(...args) {
  console.log("args:", args);
  return crypto.createHash("md5").update(args.join("")).digest("hex").toUpperCase();
}













// app.get('/betting', async (req, res) => {
//   try {
//     const sports = await Betting.find({ is_active: true, rel_type: 'odds' });
//     res.json(sports);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching betting data' });
//   }
// });




// app.get('/corn', async (req, res) => {
//   try {
//     const sports = await Betting.find({ is_active: true, rel_type: 'odds' });

//     for (const sport of sports) {
//       await updateJson(sport.rel_id, sport._id);
//     }

//     res.json(sports);
//   } catch (err) {
//     res.status(500).json({ message: 'Error syncing corn data' });
//   }
// });





// async function updateJson(key, id) {
//   try {
//     const odds = await oddsSports(key);
//     const allEvent = [];

//     if (odds.return) {
//       for (const o of odds.output) {
//         const event = await oddsEvent(o.sport_key, o.id);
//         if (event.return) {
//           allEvent.push(event);
//         }
//       }
//     }

//     const score = await oddsScores(key);
//     let history = [];
//     if (odds.return && odds.output.length > 0) {
//       history = await oddsHistorical(key, odds.output[0].commence_time);
//     }

//     await Betting.findByIdAndUpdate(id, {
//       history: JSON.stringify(history),
//       json: JSON.stringify({ odds, event: allEvent, score, history })
//     });

//   } catch (err) {
//     console.error('Error updating JSON:', err);
//   }
// }



// async function oddsSports(key) {
//   try {
//     const apiKey = 'your-api-key'; // Fetch from environment or config
//     const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds`, {
//       params: {
//         apiKey,
//         regions: 'us', // Use appropriate region
//         markets: 'h2h,spreads',
//         oddsFormat: 'decimal'
//       }
//     });
//     return { return: true, message: 'b_sync_done', output: response.data };
//   } catch (err) {
//     return { return: false, message: err.message, output: [] };
//   }
// }

// async function oddsEvent(key, id) {
//   try {
//     const apiKey = 'your-api-key'; // Fetch from environment or config
//     const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/events/${id}/odds`, {
//       params: {
//         apiKey,
//         regions: 'us',
//         markets: 'h2h,spreads',
//         oddsFormat: 'decimal'
//       }
//     });
//     return { return: true, message: 'b_sync_done', output: response.data };
//   } catch (err) {
//     return { return: false, message: err.message, output: [] };
//   }
// }

// async function oddsScores(key) {
//   try {
//     const apiKey = 'your-api-key'; // Fetch from environment or config
//     const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/scores`, {
//       params: {
//         apiKey,
//         daysFrom: 1
//       }
//     });
//     return { return: true, message: 'b_sync_done', output: response.data };
//   } catch (err) {
//     return { return: false, message: err.message, output: [] };
//   }
// }

// async function oddsHistorical(key, time) {
//   try {
//     const apiKey = 'your-api-key'; // Fetch from environment or config
//     const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds-history`, {
//       params: {
//         apiKey,
//         regions: 'us',
//         markets: 'h2h',
//         oddsFormat: 'decimal',
//         date: time
//       }
//     });
//     return { return: true, message: 'b_sync_done', output: response.data };
//   } catch (err) {
//     return { return: false, message: err.message, output: [] };
//   }
// }







// app.post('/bet_sync', async (req, res) => {
//   try {
//     const { id } = req.body;
//     const sport = await Betting.findOne({ _id: id });

//     if (sport) {
//       await updateJson(sport.rel_id, sport._id);
//       res.json({ return: true, message: 'b_sync_done' });
//     } else {
//       res.status(404).json({ return: false, message: 'Betting data not found' });
//     }
//   } catch (err) {
//     res.status(500).json({ return: false, message: 'Error syncing bet data' });
//   }
// });





// app.post('/delete', async (req, res) => {
//   try {
//     const { type, sports_id, main_id, bookmark_id, market_id } = req.body;
//     const sport = await Betting.findOne({ _id: sports_id });

//     if (sport && sport.manual) {
//       let manual = JSON.parse(sport.manual);

//       if (type === 'bookmark') {
//         manual[main_id].bookmakers.splice(bookmark_id, 1);
//       } else if (type === 'market') {
//         manual[main_id].bookmakers[bookmark_id].markets.splice(market_id, 1);
//       }

//       sport.manual = JSON.stringify(manual);
//       await sport.save();
//       res.json({ return: true });
//     } else {
//       res.status(404).json({ return: false, message: 'No betting data found or manual data is empty' });
//     }
//   } catch (err) {
//     res.status(500).json({ return: false, message: 'Error deleting data' });
//   }
// });






// app.post('/edit', async (req, res) => {
//   try {
//     const { type, sports_id, main_id, bookmark_id, market_id, name } = req.body;
//     const sport = await Betting.findOne({ _id: sports_id });

//     if (sport && sport.manual) {
//       let manual = JSON.parse(sport.manual);

//       if (type === 'bookmark') {
//         manual[main_id].bookmakers[bookmark_id].title = name;
//       } else if (type === 'market') {
//         manual[main_id].bookmakers[bookmark_id].markets[market_id].name = name;
//       } else if (type === 'market_price') {
//         manual[main_id].bookmakers[bookmark_id].markets[market_id].price = name;
//       }

//       sport.manual = JSON.stringify(manual);
//       await sport.save();
//       res.json({ return: true });
//     } else {
//       res.status(404).json({ return: false, message: 'No betting data found or manual data is empty' });
//     }
//   } catch (err) {
//     res.status(500).json({ return: false, message: 'Error editing data' });
//   }
// });













// router.get('/user-history/:id',
  exports.UserHistory = async (req, res) => {
  try {
      const userId = req.params.id;

      const history = await gameTable.aggregate([
          {
              $match: { userId: userId }
          },
          {
              $lookup: {
                  from: 'users', // Collection name in MongoDB
                  localField: 'userId',
                  foreignField: 'userId',
                  as: 'user'
              }
          },
          {
              $lookup: {
                  from: 'gamelisttables',
                  localField: 'gameId',
                  foreignField: '_id',
                  as: 'game'
              }
          },
          {
              $lookup: {
                  from: 'currencies',
                  localField: 'currencyId',
                  foreignField: '_id',
                  as: 'currency'
              }
          },
          {
              $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
          },
          {
              $unwind: { path: '$game', preserveNullAndEmptyArrays: true }
          },
          {
              $unwind: { path: '$currency', preserveNullAndEmptyArrays: true }
          },
          {
              $project: {
                  name: '$user.name',
                  game: '$game.gameName.gameName_enus',
                  currency: '$currency.name',
                  bet: '$betAmount',
                  win: '$winAmount',
                  status: 1,
                  create_date: '$timestamp'
              }
          },
          { $limit: 100 }
      ]);

      res.status(200).json({ userId, title: 'User History', history });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}
