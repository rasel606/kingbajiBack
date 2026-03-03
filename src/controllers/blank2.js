// const express = require("express");
// const crypto = require("crypto");


// const multer = require("multer");


// const BetProviderTable = require("../Models/BetProviderTable");
// const Casino_category_table = require("../Models/Casino_category_table");
// const GameTypeList = require("../Models/GameTypeTable");
// const GameListTable = require("../Models/GameListTable");
// const SportsCategoryTable = require("../Models/SportsCategoryTable");
// const AdminController = require("../Controllers/AdminController");
// const BettingTable = require("../Models/BettingTable");
// const { userbet } = require("./CornController");
// const BetHistoryTable = require("../Models/BetHistoryTable");
// const CasinoItemTable = require("../Models/Casino_item_table");
// const User = require("../Models/User");
// const WidthrowTableHistory = require("../Models/WidthrowTableHistory");
// const { default: axios } = require("axios");
// // const { refreshBalance } = require("./Refresh_blance");
// const gameTable = require("../Models/GamesTable");
// const Category = require("../Models/Category");
// const { console } = require("inspector");





// // Configurations
// const API_URL = "http://fetch.336699bet.com/launchAPP.ashx"; // Replace with actual API URL
// const OPERATOR_CODE = "rbdb";
// const PROVIDER_CODE = "CM";
// const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; // Replace with actual secret key

// // Function to generate signature
// const generateSignature = (operatorcode, providercode, secret_key) => {
//   const rawSignature = operatorcode + providercode + secret_key;
//   return crypto.createHash("md5").update(rawSignature).digest("hex").toUpperCase();
// };

// // API Route to get DeepLink
// exports.getDeepLink = async (req, res) => {
//   try {
//     // const { username, password } = req.query;
// const  username = "samit1234"
// const  password = "asdf1234"
//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and Password are required" });
//     }

//     // Validate username length
//     if (username.length < 3 || username.length > 12) {
//       return res.status(400).json({ error: "Username must be between 3 and 12 characters" });
//     }

//     // Generate signature
//     const signature = generateSignature(OPERATOR_CODE, PROVIDER_CODE, SECRET_KEY);

//     // API Request
//     const response = await axios.get(API_URL, {
//       params: {
//         operatorcode: OPERATOR_CODE,
//         providercode: PROVIDER_CODE,
//         username,
//         password,
//         signature,
//       },
//     });

//     // Return API response
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch deep link", details: error.message });
//   }
// }


// exports.checkTransaction = (req, res) => {
//     const {  referenceid } = req.query;
//     const operatorcode = "rbdb";
//     if (!operatorcode || !referenceid || !signature) {
//         return res.status(400).json({ error: "Missing required parameters" });
//     }

//     // Example: Validate signature (Modify according to your hashing logic)
//     const secretKey = "9332fd9144a3a1a8bd3ab7afac3100b0";
//     const expectedSignature = crypto.createHash("md5").update(operatorcode + referenceid + secretKey).digest("hex").toUpperCase();

//     if (signature !== expectedSignature) {
//         return res.status(401).json({ error: "Invalid signature" });
//     }

//     // Example response for a valid transaction check
//     res.json({
//         status: "success",
//         message: "Transaction found",
//         transaction: {
//             operatorcode,
//             referenceid,
//             status: "completed",
//             amount: 1000,
//             currency: "USD"
//         }
//     });
// }





// async function addGameWithCategory(gameData, category_name) {
//   let category = await Casino_category_table.findOne({ category_name });

//   if (!category) {
//     category = await Casino_category_table.create({ category_name });
//   }

//   const newGame = await GameListTable.findOneAndUpdate(
//     { g_code: gameData.g_code }, // Assuming `g_code` is a unique identifier
//     { ...gameData, category_name },
//     { upsert: true, new: true }
//   );

//   console.log("Added Game:", newGame);

//   return { newGame, category };
// }

// const fetchGamesFromApi = async (result, category_name) => {
//   console.log("Fetching games for:", result.company);

//   try {
//     const { operatorcode, providercode, key: secret_key } = result;

//     const signature = crypto
//       .createHash("md5")
//       .update(operatorcode.toLowerCase() + providercode.toUpperCase() + secret_key)
//       .digest("hex")
//       .toUpperCase();

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

//     console.log(`Fetched ${response} games from API`);

//     const gameData = JSON.parse(response.data?.gamelist || "[]");

//     console.log(`Fetched ${gameData.length} games from API`);

//     const gameResults = await Promise.all(
//       gameData.map((game) => addGameWithCategory(game, category_name))
//     );

//     res.json({ success: true, data: gameResults });
//   } catch (error) {
//     console.error("Error fetching games:", error.message);
//     return [];
//   }
// };

// exports.CasinoItemAddNEWs = async (req, res) => {
//   console.log("Received request:", req.body);

//   try {
//     const {
//       company,
//       name,
//       url,
//       login_url,
//       username,
//       password,
//       providercode,
//       operatorcode,
//       key,
//       auth_pass,
//       currency_id,
//       category_name,
//       image_url,
//     } = req.body;

//     const updateData = {
//       company,
//       name,
//       url,
//       login_url,
//       username,
//       password,
//       providercode,
//       operatorcode,
//       key,
//       auth_pass,
//       currency_id,
//       image_url,
//       updatetimestamp: Date.now(),
//     };

//     console.log("Updating provider data:", updateData);

//     let result = await BetProviderTable.findOneAndUpdate(
//       { company },
//       updateData,
//       { upsert: true, new: true }
//     );

//     console.log("Provider updated:", result);

//     const NewResult = await fetchGamesFromApi(result, category_name);

//     console.log(`Successfully processed ${NewResult.length} games.`);

//     // res.json({ success: true, data: NewResult });
//   } catch (error) {
//     console.error("Error adding casino item:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// exports.getCategoriesWithGamesAndProvidersnew = async (req, res) => {
// //  const getMatchingGames = async () => {
//   // exports.getCategoriesWithGamesAndProviders = async (req, res) => {
//     try {
//       // Fetch all categories
//       const categories = await Category.find();
//       console.log("Categories:", categories);
  
//       // Fetch games for each category along with their providers
//       const categoriesWithGamesAndProviders = await Promise.all(
//         categories.map(async (category) => {
//           // Fetch games that match category's `p_type`
//           const games = await GameListTable.aggregate([
//             {
//               $lookup: {
//                 from: "categories",
//                 localField: "p_type",
//                 foreignField: "p_type",
//                 as: "matchedCategories",
//               },
//             },
//             {
//               $match: {
//                 "matchedCategories.category_name": category.category_name, // Match category name
//               },
//             },
//             {
//               $lookup: {
//                 from: "betprovidertables",
//                 localField: "p_code",
//                 foreignField: "providercode",
//                 as: "providers",
//               },
//             },
//             {
//               $project: {
//                 g_code: 1,
//                 g_type: 1,
//                 p_code: 1,
//                 p_type: 1,
//                 gameName: 1,
//                 imgFileName: 1,
//                 serial_number: 1,
//                 "providers.providercode": 1,
//               },
//             },
//           ]);
  
//           // Extract unique provider codes
//           const providerSet = new Set();
//           games.forEach((game) => {
//             game.providers.forEach((provider) =>
//               providerSet.add(provider.providercode)
//             );
//           });
  
//           console.log("Provider Set:", providerSet);
  
//           // Fetch unique providers from BetProviderTable
//           const uniqueProviders = await BetProviderTable.find(
//             { providercode: { $in: Array.from(providerSet) } },
//             { company: 1, providercode: 1, url: 1, image_url: 1, _id: 0 }
//           );
  
//           console.log("Unique Providers:", uniqueProviders);
  
//           // Format the result
//           return {
//             category: {
//               name: category.category_name,
//               image: category.image,
//               id_active: category.id_active, // Check if category is active
//               uniqueProviders: uniqueProviders,
//             },
//             games: games, // Include games under the category
//           };
//         })
//       );
  
//       res.json(categoriesWithGamesAndProviders);
//     } catch (error) {
//       console.error("Error fetching categories with games and providers:", error);
//       res.status(500).json({ error: error.message });
//     }
  
// };

