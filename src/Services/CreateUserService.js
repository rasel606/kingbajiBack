var jwt = require('jsonwebtoken');
var md5 = require('js-md5');
const crypto = require("crypto");
// const bycrypt = require("bycryptjs");
const User = require('../Models/User');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');
// const BetProviderTable = require('../Models/BetProviderTable');
// const { generateOtp, sendEmail } = require('../utils/otpGenerator');

// Create a new user





// const fetchGamesFromApi = async (result, category_name) => {
//   try {
//     const operatorcode = result.operatorcode;
//     const providercode = result.providercode;
//     const secret_key = result.key; // Replace with actual secret key

//     const signature = crypto
//       .createHash("md5")
//       .update(operatorcode.toLowerCase() + providercode.toUpperCase() + secret_key)
//       .digest("hex")
//       .toUpperCase();


//       console.log("Signature:", signature);

//     const response = await axios.get("https://gsmd.336699bet.com/getGameList.ashx", {
//       params: {
//         operatorcode,
//         providercode,
//         lang: "en",
//         html: "0",
//         reformatjson: "yes",
//         signature,
//       },
//     });

//     // console.log("Fetched Games:", response);

//     const gameData = JSON.parse(response.data?.gamelist);
//     // console.log("Fetched Games:", gameData.length);

//     let gameResults = [];

//     for (let game of gameData) {
//       const addedGame = await addGameWithCategory(game, category_name);
//       gameResults.push(addedGame);
//     }
//     // await addGameWithCategory(gameData, category_name);
//     // console.log("Added Games:", gameResults.length);
//     return gameResults;
//   } catch (error) {
//     console.error("Error fetching games:", error.message);
//     return [];
//   }
// };
exports.register = async (req, res) => {
    
    const { userId, phone, password ,countryCode,referredbyCode} = req.body;
    console.log(req.body)
    try {
        
        // const hashedPassword = await bcrypt.hash(password, 10);
      const referredCode = Math.random().toString(36).substring(2, 8);
      const newUser = await User.create({
        userId,
        phone,
        countryCode,
        password, // Hash this in production
        referredbyCode: referredbyCode || null,
        referredCode,
        // referredLink: `http://localhost:3000/${referredCode}`,
      });

      
     
      const user =  await User.aggregate([
        { $match: { userId } },
        {
          $project: {
            userId: 1,
            name: 1,
            phone: 1,
            countryCode:1,
            balance: 1,
            referredbyCode:1,
            referredLink:1,
            referredCode:1
          },
        },
      ]);

//       const apiUser = await BetProviderTable.findOne({ operator_code: operator_code });
      
      
// console.log(apiUser)


      const operatorcode ="je1b"
        const secret = "bc80d8938723965025d6aead22982f2a"
        const newUserCreate = user[0].userId
        const newUserCreateFromApi = newUserCreate.toLowerCase()
    
        const signature = crypto
        .createHash("md5")
        .update(operatorcode + newUserCreateFromApi + secret)
        .digest("hex")
        .toUpperCase();



        const apiUrl = `http://fetch.336699bet.com/createMember.aspx?operatorcode=${operatorcode}&username=${newUserCreateFromApi}&signature=${signature}`;
    const apiResponse = await axios.get(apiUrl);
    // const apiResult = await apiResponse.json(); // Parse response JSON

    console.log("API Response:", apiResponse);

    // Retrieve Bet Provider Data
    // const apiUser = await BetProvidermodel.findOne({ operator_code: operator_code });
        
    


      
      console.log(user[0].userId);
      const token = jwt.sign({ id: user[0].userId }, "Kingbaji", { expiresIn: '1h' });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: user[0],
        
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  exports.loginUser = async (req, res) => {
    const { userId, password } = req.body;
    
    try {
      const user =  await User.aggregate([
      { $match: { userId } },
      {
        $project: {
          userId: 1,
          name: 1,
          phone: 1,
          balance: 1,
          referredbyCode:1,
          referredLink:1,
          referredCode:1
        },
      },
    ]);


      
      if (!user) return res.status(404).send({ message: 'User not found' });
      if (user[0].password !== password) return res.status(401).send({ message: 'Invalid password' });

      // Generate JWT
      const token = jwt.sign({ id: user[0].userId }, "Kingbaji", { expiresIn: '1h' });
      res.status(200).send({ token,user,response });
      
    } catch (error) {
      res.status(500).send({ message: 'Server error' });
    }
  }
  
  // Verify Route (for protected routes)
  exports.verify=(req, res) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send({ message: 'Access denied!' });
  
    try {
      const decoded = jwt.verify(token, "Kingbaji");
      res.status(200).send({ message: 'User authenticated', userId: decoded.id });
    } catch (error) {
      res.status(400).send({ message: 'Invalid token!' });
    }
  }
