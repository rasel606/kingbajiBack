const AdminModel = require('../Models/AdminModel')
const CreateService = require('../Services/CreateService')

const updateOne = require('../Services/ProfileUpdateService')
const BetProviderTable = require('../Models/BetProviderTable')

const GameTypeTable = require('../Models/GameTypeTable')
const GameListTable = require('../Models/GameListTable')
const OddSportsTable = require('../Models/OddSportsTable')

const BettingTable = require('../Models/BettingTable')
const bankTable = require('../Models/BankTable')
const SportsCategoryTable = require('../Models/SportsCategoryTable')
const GameTypeList = require('../Models/GameTypeTable')
const { default: axios } = require('axios')
const { LoginService } = require('../Services/LoginService')
// const SportsBet = require('../Models/OddSportsTable')
exports.CreateAdmin = async (req, res) => {
    console.log(req.body)
    let dataModel = AdminModel;
    let result = await CreateService(req, dataModel);
    console.log(result, "line1")
    res.json({ status: result.status, result })
};
exports.AdminLogin = async (req, res) => {

    let dataModel = AdminModel;
    let result = await LoginService(req,res, dataModel);
    console.log(result, "line1")
    res.json({ status: result.status, data: result })
};
exports.AdminProfile = async (req, res) => {
    let dataModel = AdminModel;
    let result = await updateOne(req,  dataModel);
    res.status(result.status).json({ status: result.status, data: result.data })
}

// Update add_sports


exports.GetSubcategoryById = async (req, res) => {
  const { cat_id } = req.params;
  
  try {
    // Fetch subcategories with the given cat_id
    const subCategories = await SubCategory.find({ cat_id });
    
    // Respond with the found subcategories as JSON
    res.json(subCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}








exports.Category = async (req, res) => {
  try {
    // Query to get categories where id_active is true, ordered by 'name'
    const categories = await SportsCategoryTable.find({ id_active: true })
      .sort({ name: 1 })  // Sort by 'name' in ascending order
      .exec();
    
    res.json(categories); // Return the result as a JSON response
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Express route to get the odds
exports.OddSportsByKey= async (req, res) => {
  const key = req.params.key;

  const result = await oddsSports(key);

  if (result.return) {
      res.json({ status: 'success', message: result.message, data: result.output });
  } else {
      res.json({ status: 'error', message: result.message, data: result.output });
  }
}




// Update provider status











  
  // Update type status
  exports.UpdateStatusType = async (req, res) => {
    const { id, status, table } = req.body;
  
    const Model = table ? mongoose.model(table) : GameTypeTable;
  
    try {
      const result = await Model.findByIdAndUpdate({_id:id}, {
        is_active: status !== 'checked',
      });
  
      if (result) {
        return res.json({ message: 'Update successful' });
      }
      res.status(404).json({ error: 'Type not found' });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }

  // Configure multer for file uploads


  
  // Update game status
  exports.UpdateStatusGame = async (req, res) => {
    const { id, status } = req.body;
  
    try {
      const result = await GameListTable.findByIdAndUpdate(id, {
        is_active: status !== 'true',
      });
  
      if (result) {
        return res.json({ message: 'Update successful' });
      }
      res.status(404).json({ error: 'Game not found' });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
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
  
  // Delete BetProvider by ID




  // ImageBB API Key
const imageBBApiKey = '800eab0b73b143dad5c3e09753360fe5';

// Function to upload image to ImageBB
async function uploadImageToImageBB(imagePath) {
  const formData = new FormData();
  formData.append('image', imagePath);
  

  try {
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: imageBBApiKey
      }
    });
    return response.data.data.url; // Returning the image URL
  } catch (error) {
    console.error('Error uploading image to ImageBB:', error);
    throw error;
  }
}

// Endpoint to get sports categories and betting data
 exports.GetSportsCategories = async (req, res) => {
  try {
    const result = await BettingTable.aggregate([
      {
        $match: { is_active: true },
      },
      {
        $lookup: {
          from: 'sportscategorytables', // collection name in lowercase
          localField: 'category_id',
          foreignField: '_id',
          as: 'category_details',
        },
      },
      {
        $unwind: '$category_details',
      },
      {
        $project: {
          category_name: '$category_details.name',
          c_id: '$category_details._id',
          betting_data: '$$ROOT',
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}
// Endpoint to create a new sports category (with image upload)
exports.Category_Add = async (req, res) => {
  const { name, staff_id, id_active, image } = req.body;

  try {
    // const imageUrl = await uploadImageToImageBB(image); // Upload image to ImageBB

    const newCategory = new SportsCategoryTable({
      name,
      // staff_id,
      // id_active,
      // image: imageUrl,
    });

    await newCategory.save();
    res.status(201).json({ message: 'Sports category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error creating sports category:', error);
    res.status(500).json({ error: 'An error occurred while creating the sports category.' });
  }
}






// Get casino data function
exports.GetCasinoData = async (req, res) => {
  try {
    const result = await CasinoItemTable.aggregate([
      {
        $lookup: {
          from: 'casino_category_tables',
          localField: 'categoryId',
          foreignField: 'c_id',
          as: 'category_details'
        }
      },
      {
        $unwind: '$category_details'
      },
      {
        $project: {
          'category_details': 1,
          'deposit_user_id': 1,
          'sub2': 1,
          'sub_category_item': 1,
          'image': 1,
          'casinoItem_url': 1,
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
}




  
  
  // Get list of active sports
  // router.get('/sports',
 exports.GetActiveSports = async (req, res) => {
    try {
      const sports = await GameTypeList.find({ is_active: true });
      res.json(sports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get casino items

  //router.get('/casino',
exports.GetCasino = async (req, res) => {
    try {
      const casinos = await BetProviderTable.find();
      res.json(casinos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //  app.post('/category', upload.single('image'),
  

// exports.updateOrCreateCategory = async (req, res) => {
//     const { category, id, staffId } = req.body;
//     const file = req.file;
  
//     let categoryData = { name: category, staffId };
  
//     if (id) {
//       // Update existing category
//       const existingCategory = await Category.findById(id);
//       if (existingCategory) {
//         if (file) {
//           // Delete the old image if exists
//           if (existingCategory.image && fs.existsSync(path.join('uploads/category/', existingCategory.image))) {
//             fs.unlinkSync(path.join('uploads/category/', existingCategory.image));
//           }
  
//           // Save new image
//           categoryData.image = file.filename;
//         }
//         await Category.findByIdAndUpdate(id, categoryData);
//         res.status(200).send('Category updated successfully');
//       } else {
//         res.status(404).send('Category not found');
//       }
//     } else {
//       // Add new category
//       if (file) {
//         categoryData.image = file.filename;
//       }
//       const newCategory = new Category(categoryData);
//       await newCategory.save();
//       res.status(201).send('Category added successfully');
//     }
//   }



exports.AddBank = async (req, res) => {
  const { name, acc_name, acc_number, userId, contact_id, isActive, startTime, endTime } = req.body;
  const imageFile = req.file;

  let imageUrl = '';

  if (imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile.path);
      formData.append('key', IMAGEBB_API_KEY);

      // Upload image to ImageBB
      const imageUploadResponse = await axios.post(IMAGEBB_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      imageUrl = imageUploadResponse.data.data.url; // Extract image URL from response
    } catch (error) {
      return res.status(500).json({ error: 'Failed to upload image to ImageBB', message: error.message });
    }
  }

  const newBank = new bankTable({
    name,
    acc_name,
    acc_number,
    userId,
    contact_id,
    isActive,
    startTime,
    endTime,
    image: imageUrl
  });

  try {
    await newBank.save();
    res.status(200).json({ message: 'Bank added successfully', data: newBank });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bank', message: error.message });
  }
}



exports.DeleteBank = async (req, res) => {
  const { id } = req.params;

  try {
    const bank = await bankTable.findById(id);

    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    // If image exists, delete it from ImageBB (if needed)
    if (bank.image) {
      // ImageBB doesn't provide direct image deletion via their API.
      // If required, you can remove images from your own server or handle this via another mechanism.
    }

    await bankTable.findByIdAndDelete(id);
    res.status(200).json({ message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bank', message: error.message });
  }
}
  

// Express route handler for odds_betting
exports.oddsBetting = async (req, res) => {
  try {
      const { id } = req.params;

      // Find all betting records for the given category_id
      const bets = await BettingTable.find({ category_id: id });
      const output = [];

      if (bets.length > 0) {
          for (const bet of bets) {
              const dt = await OddSportsTable(bet.rel_id);

              if (dt.return) {
                  const sports = await OddSportsTable.findOne({ sports_key: bet.rel_id });
                  output.push({ sports, bet: dt.output });
              }
          }
      }

      res.json(output);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching betting data.' });
  }
};




//router.get('/odds-sync'

exports.SyncOdds = async (req, res) => {
  try {
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${getApiKey()}`);
    const data = response.data;
    
    // Clear current data from the database
    await SportsBet.deleteMany({});

    // Insert new data into the database
    for (const sport of data) {
      const bet = { /* logic to fetch the bet data, e.g., betting_key_check */ };
      await OddSportsTable.create({
        sports_key: sport.key,
        groups: sport.group,
        title: sport.title,
        description: sport.description,
        is_active: sport.active,
        has_outrights: sport.has_outrights,
        staff_id: getStaffId(),
        bet,
        datetime: new Date()
      });
    }

    res.json({ return: true, message: 'Sync done', output: data });
  } catch (error) {
    res.status(500).json({ return: false, message: error.message });
  }
}

// Group odds
//router.get('/odds-group
exports.OddsGroup = async (req, res) => {
  try {
    const groups = await SportsBet.aggregate([
      { $group: { _id: "$groups" } },
      { $sort: { _id: 1 } }
    ]);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get odds for specific sport
//router.get('/odds/:key',
exports.GetOddsByKey = async (req, res) => {
  const { key } = req.params;
  const apiKey = getApiKey();
  const regions = getRegion();
  const oddsFormat = getOddsFormat();

  try {
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=${regions}&markets=h2h,spreads&oddsFormat=${oddsFormat}`);
    res.json({ return: true, message: 'Odds retrieved', output: response.data });
  } catch (error) {
    res.status(500).json({ return: false, message: error.message });
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
      json: JSON.stringify(req.body), // Assuming you want to store the request body as a JSON string
    });

    // Save the new betting entry
    await newBetting.save();

    // If it's a betting odds type, update the 'tblodds_sports' collection
    if (type === 'BETTING_ODDS') {
      // Assuming you have a separate model for tblodds_sports
      const tbloddsSports =  await OddSportsTable.findOne({
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

exports.oddsActived = async (req, res) => {
  const { key } = req.params; // Extract key from URL parameters

  try {
      const find = await BettingTable.findOne({
          rel_id: key,
          rel_type: 'BETTING_ODDS', // Adjust this value as necessary
          is_active: true
      });

      if (find) {
          return res.json(find); // Return found betting data
      } else {
          return res.status(404).json({ message: 'Odds not found or inactive' });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
};





// Function to fetch active betting odds
exports.OddsActiveKey= async (req, res) => {
  const { key } = req.params;
  try {
      const result = await BettingTable.findOne({
          rel_id: key,
          rel_type: 'BETTING_ODDS', // Replace this with the constant or actual value
          is_active: true,
      });

      if (result) {
          return res.status(200).json(result);
      } else {
          return res.status(404).json({ message: 'No active odds found' });
      }
  } catch (error) {
      return res.status(500).json({ message: 'Server Error', error });
  }
}

// Add sports betting
//router.post('/add-sports',
exports.AddSportsBetting = async (req, res) => {
  const { key, type, category } = req.body;

  try {
    const existingBet = await BettingTable.findOne({ rel_id: key, rel_type: type });
    if (existingBet) return res.status(400).json({ return: false, message: 'Bet already exists' });

    const newBet = new BettingTable({
      rel_id: key,
      rel_type: type,
      staff_id: getStaffId(),
      category_id: category
    });
    await newBet.save();

    // Update the sports bet
    await BettingTable.updateOne({ sports_key: key }, { $set: { bet: 1 } });

    res.json({ return: true, message: 'Bet added successfully' });
  } catch (error) {
    res.status(500).json({ return: false, message: error.message });
  }
}


// Route to add casino item
// app.post('/casino-item-add',
  
// exports.CasinoItemAdd = async (req, res) => {
//   const { id, company, provider, opcode, key, currency_id, auth_pass } = req.body;
//   const file = req.file;
  
//   // Validation
//   if (!company || !provider || !opcode || !key || !currency_id || !auth_pass) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   let imageUrl = '';
  
//   if (file) {
//     try {
//       // Upload image to ImageBB
//       imageUrl = await uploadImageToImageBB(file.buffer);
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }

//   const data = {
//     company,
//     provider,
//     opcode,
//     key,
//     currency_id,
//     auth_pass,
//     image: imageUrl
//   };

//   try {
//     if (id) {
//       // Update existing record
//       await BetHistory.updateOne({ _id: id }, data);
//       return res.status(200).json({ message: 'Item updated successfully' });
//     } else {
//       // Insert new record
//       const newItem = new BetHistory(data);
//       await newItem.save();
//       return res.status(201).json({ message: 'Item added successfully' });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: 'Database error' });
//   }
// }


// Update sports betting category
//router.put('/update-sports/:id',
exports.UpdateSportsBettingCategory = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  try {
    const bet = await BettingTable.findById(id);
    if (!bet) return res.status(404).json({ return: false, message: 'Bet not found' });

    bet.category_id = category;
    await bet.save();

    res.json({ return: true, message: 'Bet updated' });
  } catch (error) {
    res.status(500).json({ return: false, message: error.message });
  }
}