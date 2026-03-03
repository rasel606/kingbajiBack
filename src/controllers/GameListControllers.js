// // // // Enhanced GameListTable model with aggregations

// // // import GameListTable from "../Models/GameListTable";
// // // import betprovidertables from "../Models/BetProviderTable";
// // // import categories from "../Models/Category";




// // // const GameListTable = mongoose.model('GameListTable', GameListTable);

// // // // Aggregation queries
// // // exports.getCategoriesWithProvidersGameList = async (req, res) => {
// // //   try {
// // //     let { 
// // //       provider = [], 
// // //       category, 
// // //       page = 1, 
// // //       gameName = '',
// // //       sortBy = 'serial_number',
// // //       sortOrder = 'asc'
// // //     } = req.query;

// // //     // Validate inputs
// // //     page = parseInt(page);
// // //     if (isNaN(page) || page < 1) {
// // //       return res.status(400).json({ 
// // //         success: false, 
// // //         message: "Invalid page number" 
// // //       });
// // //     }

// // //     const limit = 24;
// // //     const skip = (page - 1) * limit;

// // //     // Aggregation pipeline for games with category and provider data
// // //     const pipeline = [
// // //       // Match games by category and active status
// // //       {
// // //         $match: {
// // //           category_name: category,
// // //           is_active: true
// // //         }
// // //       },
// // //       // Lookup category details
// // //       {
// // //         $lookup: {
// // //           from: 'categories',
// // //           localField: 'category_name',
// // //           foreignField: 'category_name',
// // //           as: 'category_details'
// // //         }
// // //       },
// // //       // Lookup provider details
// // //       {
// // //         $lookup: {
// // //           from: 'betprovidertables',
// // //           localField: 'p_code',
// // //           foreignField: 'providercode',
// // //           as: 'provider_details'
// // //         }
// // //       },
// // //       // Unwind arrays
// // //       {
// // //         $unwind: {
// // //           path: '$category_details',
// // //           preserveNullAndEmptyArrays: true
// // //         }
// // //       },
// // //       {
// // //         $unwind: {
// // //           path: '$provider_details',
// // //           preserveNullAndEmptyArrays: true
// // //         }
// // //       },
// // //       // Filter by provider if specified
// // //       ...(provider.length > 0 && provider[0] !== 'ALL' ? [{
// // //         $match: {
// // //           'p_code': { $in: provider }
// // //         }
// // //       }] : []),
// // //       // Filter by game name if specified
// // //       ...(gameName ? [{
// // //         $match: {
// // //           $or: [
// // //             { 'gameName.gameName_enus': { $regex: gameName, $options: 'i' } },
// // //             { 'gameName.gameName_zhcn': { $regex: gameName, $options: 'i' } },
// // //             { 'gameName.gameName_zhtw': { $regex: gameName, $options: 'i' } }
// // //           ]
// // //         }
// // //       }] : []),
// // //       // Project required fields
// // //       {
// // //         $project: {
// // //           g_code: 1,
// // //           g_type: 1,
// // //           p_code: 1,
// // //           p_type: 1,
// // //           status: 1,
// // //           gameName: 1,
// // //           imgFileName: 1,
// // //           serial_number: 1,
// // //           is_active: 1,
// // //           is_hot: 1,
// // //           isFeatured: 1,
// // //           category_name: 1,
// // //           provider_company: '$provider_details.company',
// // //           provider_image: '$provider_details.image_url',
// // //           category_image: '$category_details.image'
// // //         }
// // //       },
// // //       // Sort
// // //       {
// // //         $sort: {
// // //           [sortBy]: sortOrder === 'asc' ? 1 : -1
// // //         }
// // //       },
// // //       // Pagination
// // //       {
// // //         $facet: {
// // //           metadata: [
// // //             { $count: "totalCount" },
// // //             { $addFields: { page: page, limit: limit } }
// // //           ],
// // //           data: [
// // //             { $skip: skip },
// // //             { $limit: limit }
// // //           ]
// // //         }
// // //       }
// // //     ];

// // //     const result = await GameListTable.aggregate(pipeline);
    
// // //     const games = result[0]?.data || [];
// // //     const total = result[0]?.metadata[0]?.totalCount || 0;

// // //     // Get unique providers for the category
// // //     const providers = await GameListTable.aggregate([
// // //       {
// // //         $match: { category_name: category, is_active: true }
// // //       },
// // //       {
// // //         $lookup: {
// // //           from: 'betprovidertables',
// // //           localField: 'p_code',
// // //           foreignField: 'providercode',
// // //           as: 'provider'
// // //         }
// // //       },
// // //       {
// // //         $unwind: '$provider'
// // //       },
// // //       {
// // //         $group: {
// // //           _id: '$p_code',
// // //           company: { $first: '$provider.company' },
// // //           providercode: { $first: '$provider.providercode' },
// // //           image_url: { $first: '$provider.image_url' },
// // //           gameCount: { $sum: 1 }
// // //         }
// // //       },
// // //       {
// // //         $sort: { company: 1 }
// // //       }
// // //     ]);

// // //     res.json({
// // //       success: true,
// // //       data: games,
// // //       providers: providers,
// // //       pagination: {
// // //         page,
// // //         limit,
// // //         total,
// // //         hasMore: skip + games.length < total
// // //       },
// // //     });
// // //   } catch (error) {
// // //     console.error("Error fetching games:", error);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: "Internal server error",
// // //     });
// // //   }
// // // };

// // // // Get featured games aggregation
// // // exports.getFeaturedGames = async (req, res) => {
// // //   try {
// // //     const featuredGames = await GameListTable.aggregate([
// // //       {
// // //         $match: {
// // //           isFeatured: true,
// // //           is_active: true
// // //         }
// // //       },
// // //       {
// // //         $lookup: {
// // //           from: 'betprovidertables',
// // //           localField: 'p_code',
// // //           foreignField: 'providercode',
// // //           as: 'provider'
// // //         }
// // //       },
// // //       {
// // //         $unwind: '$provider'
// // //       },
// // //       {
// // //         $project: {
// // //           g_code: 1,
// // //           gameName: 1,
// // //           imgFileName: 1,
// // //           p_code: 1,
// // //           provider_company: '$provider.company',
// // //           is_hot: 1,
// // //           serial_number: 1
// // //         }
// // //       },
// // //       {
// // //         $sort: { serial_number: 1 }
// // //       },
// // //       {
// // //         $limit: 10
// // //       }
// // //     ]);

// // //     res.json({
// // //       success: true,
// // //       data: featuredGames
// // //     });
// // //   } catch (error) {
// // //     console.error("Error fetching featured games:", error);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: "Internal server error"
// // //     });
// // //   }
// // // };

// // // // Get hot games aggregation
// // // exports.getHotGames = async (req, res) => {
// // //   try {
// // //     const hotGames = await GameListTable.aggregate([
// // //       {
// // //         $match: {
// // //           is_hot: true,
// // //           is_active: true
// // //         }
// // //       },
// // //       {
// // //         $lookup: {
// // //           from: 'betprovidertables',
// // //           localField: 'p_code',
// // //           foreignField: 'providercode',
// // //           as: 'provider'
// // //         }
// // //       },
// // //       {
// // //         $unwind: '$provider'
// // //       },
// // //       {
// // //         $project: {
// // //           g_code: 1,
// // //           gameName: 1,
// // //           imgFileName: 1,
// // //           p_code: 1,
// // //           provider_company: '$provider.company',
// // //           is_hot: 1,
// // //           serial_number: 1
// // //         }
// // //       },
// // //       {
// // //         $sort: { serial_number: 1 }
// // //       },
// // //       {
// // //         $limit: 12
// // //       }
// // //     ]);

// // //     res.json({
// // //       success: true,
// // //       data: hotGames
// // //     });
// // //   } catch (error) {
// // //     console.error("Error fetching hot games:", error);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: "Internal server error"
// // //     });
// // //   }
// // // };



// // // controllers/gameController.js
// // const GameListTable = require('../Models/GameListTable');
// // const Category = require('../Models/Category');
// // const BetProviderTable = require('../Models/BetProviderTable');
// // const User = require('../Models/User');

// // // API 1: Get all game data (categories, providers, games, featured, hot games)
// // exports.getCompleteGameData = async (req, res) => {
// //   try {
// //     const { 
// //       category = 'ALL',
// //       provider = 'ALL', 
// //       page = 1, 
// //       search = '',
// //       sortBy = 'serial_number',
// //       sortOrder = 'asc'
// //     } = req.query;

// //     // Validate inputs
// //     const currentPage = parseInt(page);
// //     const limit = 24;
// //     const skip = (currentPage - 1) * limit;

// //     // Build match conditions for games
// //     const gameMatchConditions = {
// //       is_active: true
// //     };

// //     if (category && category !== 'ALL') {
// //       gameMatchConditions.category_name = category;
// //     }

// //     if (provider && provider !== 'ALL') {
// //       gameMatchConditions.p_code = provider;
// //     }

// //     if (search) {
// //       gameMatchConditions.$or = [
// //         { 'gameName.gameName_enus': { $regex: search, $options: 'i' } },
// //         { 'gameName.gameName_zhcn': { $regex: search, $options: 'i' } },
// //         { 'gameName.gameName_zhtw': { $regex: search, $options: 'i' } },
// //         { 'g_code': { $regex: search, $options: 'i' } }
// //       ];
// //     }

// //     // Main aggregation pipeline for games
// //     const gamesPipeline = [
// //       { $match: gameMatchConditions },
      
// //       // Lookup provider details
// //       {
// //         $lookup: {
// //           from: 'betprovidertables',
// //           localField: 'p_code',
// //           foreignField: 'providercode',
// //           as: 'provider_details'
// //         }
// //       },
      
// //       // Lookup category details
// //       {
// //         $lookup: {
// //           from: 'categories',
// //           localField: 'category_name',
// //           foreignField: 'category_name',
// //           as: 'category_details'
// //         }
// //       },
      
// //       // Unwind arrays
// //       {
// //         $unwind: {
// //           path: '$provider_details',
// //           preserveNullAndEmptyArrays: true
// //         }
// //       },
// //       {
// //         $unwind: {
// //           path: '$category_details',
// //           preserveNullAndEmptyArrays: true
// //         }
// //       },
      
// //       // Project required fields
// //       {
// //         $project: {
// //           _id: 1,
// //           g_code: 1,
// //           g_type: 1,
// //           p_code: 1,
// //           p_type: 1,
// //           status: 1,
// //           gameName: 1,
// //           imgFileName: 1,
// //           serial_number: 1,
// //           is_active: 1,
// //           is_hot: 1,
// //           isFeatured: 1,
// //           category_name: 1,
// //           provider_company: '$provider_details.company',
// //           provider_image: '$provider_details.image_url',
// //           category_image: '$category_details.image',
// //           timestamp: 1,
// //           updatetimestamp: 1
// //         }
// //       },
      
// //       // Sort
// //       {
// //         $sort: {
// //           [sortBy]: sortOrder === 'asc' ? 1 : -1,
// //           '_id': 1
// //         }
// //       },
      
// //       // Pagination
// //       {
// //         $facet: {
// //           metadata: [{ $count: "totalCount" }],
// //           data: [
// //             { $skip: skip },
// //             { $limit: limit }
// //           ]
// //         }
// //       }
// //     ];

// //     // Get all categories
// //     const categoriesPipeline = [
// //       {
// //         $match: { id_active: true }
// //       },
// //       {
// //         $lookup: {
// //           from: 'gamelisttables',
// //           localField: 'category_name',
// //           foreignField: 'category_name',
// //           as: 'games'
// //         }
// //       },
// //       {
// //         $project: {
// //           _id: 1,
// //           category_name: 1,
// //           category_code: 1,
// //           image: 1,
// //           gameCount: { $size: '$games' },
// //           timestamp: 1
// //         }
// //       },
// //       {
// //         $sort: { category_name: 1 }
// //       }
// //     ];

// //     // Get all providers
// //     const providersPipeline = [
// //       {
// //         $match: { id_active: true }
// //       },
// //       {
// //         $lookup: {
// //           from: 'gamelisttables',
// //           localField: 'providercode',
// //           foreignField: 'p_code',
// //           as: 'games'
// //         }
// //       },
// //       {
// //         $project: {
// //           _id: 1,
// //           company: 1,
// //           providercode: 1,
// //           image_url: 1,
// //           type: 1,
// //           gameCount: { $size: '$games' },
// //           timestamp: 1
// //         }
// //       },
// //       {
// //         $sort: { company: 1 }
// //       }
// //     ];

// //     // Get featured games
// //     const featuredPipeline = [
// //       {
// //         $match: {
// //           isFeatured: true,
// //           is_active: true
// //         }
// //       },
// //       {
// //         $lookup: {
// //           from: 'betprovidertables',
// //           localField: 'p_code',
// //           foreignField: 'providercode',
// //           as: 'provider'
// //         }
// //       },
// //       {
// //         $unwind: '$provider'
// //       },
// //       {
// //         $project: {
// //           _id: 1,
// //           g_code: 1,
// //           gameName: 1,
// //           imgFileName: 1,
// //           p_code: 1,
// //           p_type: 1,
// //           provider_company: '$provider.company',
// //           is_hot: 1,
// //           serial_number: 1,
// //           category_name: 1
// //         }
// //       },
// //       {
// //         $sort: { serial_number: 1 }
// //       },
// //       {
// //         $limit: 10
// //       }
// //     ];

// //     // Get hot games
// //     const hotGamesPipeline = [
// //       {
// //         $match: {
// //           is_hot: true,
// //           is_active: true
// //         }
// //       },
// //       {
// //         $lookup: {
// //           from: 'betprovidertables',
// //           localField: 'p_code',
// //           foreignField: 'providercode',
// //           as: 'provider'
// //         }
// //       },
// //       {
// //         $unwind: '$provider'
// //       },
// //       {
// //         $project: {
// //           _id: 1,
// //           g_code: 1,
// //           gameName: 1,
// //           imgFileName: 1,
// //           p_code: 1,
// //           p_type: 1,
// //           provider_company: '$provider.company',
// //           is_hot: 1,
// //           serial_number: 1,
// //           category_name: 1
// //         }
// //       },
// //       {
// //         $sort: { serial_number: 1 }
// //       },
// //       {
// //         $limit: 12
// //       }
// //     ];

// //     // Execute all aggregations in parallel
// //     const [
// //       gamesResult,
// //       categoriesResult,
// //       providersResult,
// //       featuredResult,
// //       hotGamesResult
// //     ] = await Promise.all([
// //       GameListTable.aggregate(gamesPipeline),
// //       Category.aggregate(categoriesPipeline),
// //       BetProviderTable.aggregate(providersPipeline),
// //       GameListTable.aggregate(featuredPipeline),
// //       GameListTable.aggregate(hotGamesPipeline)
// //     ]);

// //     const games = gamesResult[0]?.data || [];
// //     const total = gamesResult[0]?.metadata[0]?.totalCount || 0;

// //     res.json({
// //       success: true,
// //       data: {
// //         games: games,
// //         categories: categoriesResult,
// //         providers: providersResult,
// //         featuredGames: featuredResult,
// //         hotGames: hotGamesResult,
// //         pagination: {
// //           page: currentPage,
// //           limit: limit,
// //           total: total,
// //           totalPages: Math.ceil(total / limit),
// //           hasMore: skip + games.length < total
// //         }
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Error fetching complete game data:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: "Internal server error",
// //     });
// //   }
// // };

// // // API 2: Launch Game with real-time updates
// // exports.launchGame = async (req, res) => {
// //   let gameData = null;
// //   let gameId = null;
  
// //   try {
// //     const { userId, game_id, p_code, p_type } = req.body;
// //     const socket = require('../socket/gameSocket');

// //     // Input validation
// //     if (!userId || !game_id || !p_code) {
// //       return res.status(400).json({ 
// //         success: false, 
// //         errCode: 1, 
// //         errMsg: "Missing required fields: userId, game_id, p_code" 
// //       });
// //     }

// //     // Find user
// //     const user = await User.findOne({ userId });
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false, 
// //         errCode: 1, 
// //         errMsg: "User not found." 
// //       });
// //     }

// //     // Find game
// //     gameId = game_id;
// //     gameData = await GameListTable.findOne({ g_code: game_id, p_code });
// //     if (!gameData) {
// //       return res.status(404).json({ 
// //         success: false, 
// //         errCode: 1, 
// //         errMsg: "Game not found." 
// //       });
// //     }

// //     // Emit game launch started
// //     socket.emitGameStatusChange(gameData.category_name, gameId, 'launching');

// //     // Find provider/agent details
// //     const agent = await GameListTable.aggregate([
// //       { $match: { g_code: gameId, p_code } },
// //       {
// //         $lookup: {
// //           from: "betprovidertables",
// //           localField: "p_code",
// //           foreignField: "providercode",
// //           as: "provider"
// //         }
// //       },
// //       { $unwind: "$provider" },
// //       {
// //         $project: {
// //           providercode: "$provider.providercode",
// //           operatorcode: "$provider.operatorcode",
// //           key: "$provider.key",
// //           auth_pass: "$provider.auth_pass",
// //           game_type: "$p_type",
// //           company: "$provider.company"
// //         }
// //       }
// //     ]);

// //     if (!agent.length) {
// //       socket.emitGameStatusChange(gameData.category_name, gameId, 'failed');
// //       return res.status(404).json({ 
// //         success: false, 
// //         errCode: 1, 
// //         errMsg: "Game provider not found." 
// //       });
// //     }

// //     const provider = agent[0];
// //     const userBalance = user.balance;

// //     // Handle balance transfer if user has balance
// //     if (userBalance > 0) {
// //       const transactionId = generateTransactionId();
      
// //       // Simulate balance transfer (replace with actual provider API call)
// //       const transferSuccess = await simulateBalanceTransfer({
// //         userId,
// //         amount: userBalance,
// //         transactionId,
// //         provider
// //       });

// //       if (transferSuccess) {
// //         // Update user balance
// //         await User.updateOne(
// //           { userId: user.userId },
// //           { 
// //             balance: 0, 
// //             last_game_id: gameData.g_code, 
// //             agentId: provider.providercode 
// //           }
// //         );

// //         // Emit balance update
// //         socket.emitBalanceUpdate(userId, 0);
// //       }
// //     }

// //     // Launch game (simulate API call to game provider)
// //     const gameLaunchResult = await simulateGameLaunch({
// //       userId,
// //       gameId,
// //       provider,
// //       gameType: gameData.p_type
// //     });

// //     if (gameLaunchResult.success) {
// //       // Emit success status
// //       socket.emitGameStatusChange(gameData.category_name, gameId, 'launched');
      
// //       // Emit game activity
// //       socket.emitGameActivity(gameData.category_name, {
// //         gameId: gameId,
// //         gameName: gameData.gameName?.gameName_enus,
// //         userId: userId,
// //         action: 'launched',
// //         timestamp: new Date()
// //       });

// //       return res.status(200).json({
// //         success: true,
// //         errCode: 0,
// //         errMsg: "Success",
// //         gameUrl: gameLaunchResult.gameUrl,
// //         balance: 0 // Updated balance
// //       });
// //     } else {
// //       socket.emitGameStatusChange(gameData.category_name, gameId, 'failed');
// //       return res.status(400).json({
// //         success: false,
// //         errCode: gameLaunchResult.errCode,
// //         errMsg: gameLaunchResult.errMsg
// //       });
// //     }

// //   } catch (error) {
// //     console.error("Launch Game Error:", error);
    
// //     // Emit error status
// //     if (gameData && gameId) {
// //       const socket = require('../socket/gameSocket');
// //       socket.emitGameStatusChange(gameData.category_name, gameId, 'error');
// //     }
    
// //     res.status(500).json({ 
// //       success: false,
// //       errCode: 500, 
// //       errMsg: "Server error." 
// //     });
// //   }
// // };

// // // Helper functions
// // function generateTransactionId() {
// //   return `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);
// // }

// // function randomStr(length) {
// //   let result = '';
// //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// //   for (let i = 0; i < length; i++) {
// //     result += characters.charAt(Math.floor(Math.random() * characters.length));
// //   }
// //   return result;
// // }

// // async function simulateBalanceTransfer(transferData) {
// //   // Simulate API call to provider's transfer endpoint
// //   await new Promise(resolve => setTimeout(resolve, 1000));
// //   return true; // Simulate success
// // }

// // async function simulateGameLaunch(launchData) {
// //   // Simulate API call to provider's game launch endpoint
// //   await new Promise(resolve => setTimeout(resolve, 1500));
  
// //   return {
// //     success: true,
// //     gameUrl: `https://games-provider.com/launch?game=${launchData.gameId}&user=${launchData.userId}&token=${randomStr(20)}`,
// //     errCode: 0,
// //     errMsg: "SUCCESS"
// //   };
// // }

// // controllers/optimizedGameController.js
// const GameListTable = require('../Models/GameListTable');
// const Category = require('../Models/Category');
// const BetProviderTable = require('../Models/BetProviderTable');
// const User = require('../Models/User');
// const socketIO = require('../socket/gameSocket');

// // Cache system for better performance
// const cache = new Map();
// const CACHE_TTL = 30000; // 30 seconds cache

// // Clear cache periodically
// setInterval(() => {
//     const now = Date.now();
//     for (let [key, value] of cache.entries()) {
//         if (now - value.timestamp > CACHE_TTL) {
//             cache.delete(key);
//         }
//     }
// }, 60000);

// // API 1: Optimized Complete Game Data
// exports.getCompleteGameData = async (req, res) => {
//     try {
//         const {
//             category = 'ALL',
//             provider = 'ALL',
//             page = 1,
//             search = '',
//             sortBy = 'serial_number',
//             sortOrder = 'asc'
//         } = req.query;

//         // Create cache key
//         const cacheKey = `games_${category}_${provider}_${page}_${search}_${sortBy}_${sortOrder}`;

//         // Check cache first
//         const cached = cache.get(cacheKey);
//         if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//             console.log('📦 Serving from cache:', cacheKey);
//             return res.json(cached.data);
//         }

//         const currentPage = Math.max(1, parseInt(page));
//         const limit = 24;
//         const skip = (currentPage - 1) * limit;

//         // Build optimized match conditions
//         const gameMatchConditions = {
//             is_active: true
//         };

//         if (category && category !== 'ALL') {
//             gameMatchConditions.category_name = category;
//         }

//         if (provider && provider !== 'ALL') {
//             gameMatchConditions.p_code = provider;
//         }

//         if (search && search.trim() !== '') {
//             const searchRegex = { $regex: search.trim(), $options: 'i' };
//             gameMatchConditions.$or = [
//                 { 'gameName.gameName_enus': searchRegex },
//                 { 'g_code': searchRegex }
//             ];
//         }

//         // OPTIMIZED AGGREGATION PIPELINE
//         const gamesPipeline = [
//             // Stage 1: Match with conditions (uses indexes)
//             { $match: gameMatchConditions },

//             // Stage 2: Single optimized lookup for providers
//             {
//                 $lookup: {
//                     from: 'betprovidertables',
//                     let: { gamePCode: '$p_code' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ['$providercode', '$$gamePCode'] },
//                                 id_active: true
//                             }
//                         },
//                         { $project: { company: 1, image_url: 1, providercode: 1 } }
//                     ],
//                     as: 'provider_details'
//                 }
//             },

//             // Stage 3: Single optimized lookup for categories
//             {
//                 $lookup: {
//                     from: 'categories',
//                     let: { gameCategory: '$category_name' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ['$category_name', '$$gameCategory'] },
//                                 id_active: true
//                             }
//                         },
//                         { $project: { image: 1, category_name: 1 } }
//                     ],
//                     as: 'category_details'
//                 }
//             },

//             // Stage 4: Add computed fields
//             {
//                 $addFields: {
//                     provider_company: { $arrayElemAt: ['$provider_details.company', 0] },
//                     provider_image: { $arrayElemAt: ['$provider_details.image_url', 0] },
//                     category_image: { $arrayElemAt: ['$category_details.image', 0] },
//                     // Add game count for providers
//                     provider_game_count: { $size: '$provider_details' }
//                 }
//             },

//             // Stage 5: Project only needed fields
//             {
//                 $project: {
//                     _id: 1,
//                     g_code: 1,
//                     g_type: 1,
//                     p_code: 1,
//                     p_type: 1,
//                     status: 1,
//                     gameName: 1,
//                     imgFileName: 1,
//                     serial_number: 1,
//                     is_active: 1,
//                     is_hot: 1,
//                     isFeatured: 1,
//                     category_name: 1,
//                     provider_company: 1,
//                     provider_image: 1,
//                     category_image: 1,
//                     timestamp: 1,
//                     updatetimestamp: 1
//                 }
//             },

//             // Stage 6: Sort (using indexes)
//             {
//                 $sort: {
//                     [sortBy]: sortOrder === 'asc' ? 1 : -1,
//                     '_id': 1
//                 }
//             },

//             // Stage 7: Pagination with facet
//             {
//                 $facet: {
//                     metadata: [{ $count: "totalCount" }],
//                     data: [
//                         { $skip: skip },
//                         { $limit: limit }
//                     ]
//                 }
//             }
//         ];

//         // PARALLEL EXECUTION - Much faster
//         const [
//             gamesResult,
//             categoriesResult,
//             providersResult,
//             featuredResult,
//             hotGamesResult
//         ] = await Promise.all([
//             // Main games query
//             GameListTable.aggregate(gamesPipeline).allowDiskUse(false),

//             // Categories with game counts
//             Category.aggregate([
//                 { $match: { id_active: true } },
//                 {
//                     $lookup: {
//                         from: 'gamelisttables',
//                         let: { catName: '$category_name' },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: { $eq: ['$category_name', '$$catName'] },
//                                     is_active: true
//                                 }
//                             }
//                         ],
//                         as: 'games'
//                     }
//                 },
//                 {
//                     $project: {
//                         category_name: 1,
//                         category_code: 1,
//                         image: 1,
//                         gameCount: { $size: '$games' }
//                     }
//                 },
//                 { $sort: { category_name: 1 } }
//             ]),

//             // Providers with game counts
//             BetProviderTable.aggregate([
//                 { $match: { id_active: true } },
//                 {
//                     $lookup: {
//                         from: 'gamelisttables',
//                         let: { providerCode: '$providercode' },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: { $eq: ['$p_code', '$$providerCode'] },
//                                     is_active: true
//                                 }
//                             }
//                         ],
//                         as: 'games'
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         company: 1,
//                         providercode: 1,
//                         image_url: 1,
//                         type: 1,
//                         gameCount: { $size: '$games' }
//                     }
//                 },
//                 { $sort: { company: 1 } }
//             ]),

//             // Featured games - simple find (faster)
//             GameListTable.find({
//                 isFeatured: true,
//                 is_active: true
//             })
//                 .select('g_code gameName imgFileName p_code p_type serial_number category_name')
//                 .sort({ serial_number: 1 })
//                 .limit(10)
//                 .lean(),

//             // Hot games - simple find (faster)
//             GameListTable.find({
//                 is_hot: true,
//                 is_active: true
//             })
//                 .select('g_code gameName imgFileName p_code p_type serial_number category_name')
//                 .sort({ serial_number: 1 })
//                 .limit(12)
//                 .lean()
//         ]);

//         const games = gamesResult[0]?.data || [];
//         const total = gamesResult[0]?.metadata[0]?.totalCount || 0;

//         // Prepare response
//         const responseData = {
//             success: true,
//             data: {
//                 games: games,
//                 categories: categoriesResult,
//                 providers: providersResult,
//                 featuredGames: featuredResult,
//                 hotGames: hotGamesResult,
//                 pagination: {
//                     page: currentPage,
//                     limit: limit,
//                     total: total,
//                     totalPages: Math.ceil(total / limit),
//                     hasMore: skip + games.length < total
//                 },
//                 filters: {
//                     category,
//                     provider,
//                     search,
//                     sortBy,
//                     sortOrder
//                 }
//             }
//         };

//         // Cache the result
//         cache.set(cacheKey, {
//             data: responseData,
//             timestamp: Date.now()
//         });

//         console.log(`✅ Loaded ${games.length} games in ${category} category`);
//         res.json(responseData);

//     } catch (error) {
//         console.error("❌ Error in getCompleteGameData:", error);
//         res.status(500).json({
//             success: false,
//             error: "Internal server error",
//             message: error.message
//         });
//     }
// };

// // API 2: Fast Game Launch
// exports.launchGame = async (req, res) => {
//     let gameData = null;
//     let gameId = null;

//     try {
//         const { userId, game_id, p_code, p_type } = req.body;

//         // Input validation
//         if (!userId || !game_id || !p_code) {
//             return res.status(400).json({
//                 success: false,
//                 errCode: 1,
//                 errMsg: "Missing required fields"
//             });
//         }

//         // Find user and game in parallel
//         const [user, game] = await Promise.all([
//             User.findOne({ userId }).select('balance username userId'),
//             GameListTable.findOne({ g_code: game_id, p_code })
//         ]);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 errCode: 1,
//                 errMsg: "User not found."
//             });
//         }

//         if (!game) {
//             return res.status(404).json({
//                 success: false,
//                 errCode: 1,
//                 errMsg: "Game not found."
//             });
//         }

//         gameId = game_id;
//         gameData = game;

//         // Emit game launch started
//         socketIO.emitGameStatusChange(gameData.category_name, gameId, 'launching', 'Game launch initiated');

//         // Find provider details
//         const agent = await BetProviderTable.findOne({
//             providercode: p_code,
//             id_active: true
//         }).select('providercode operatorcode key auth_pass company');

//         if (!agent) {
//             socketIO.emitGameStatusChange(gameData.category_name, gameId, 'failed', 'Provider not found');
//             return res.status(404).json({
//                 success: false,
//                 errCode: 1,
//                 errMsg: "Game provider not found."
//             });
//         }

//         const userBalance = user.balance;

//         // Simulate game launch (replace with your actual provider API)
//         const gameLaunchResult = await simulateGameLaunch({
//             userId,
//             gameId,
//             provider: agent,
//             gameType: gameData.p_type,
//             userBalance,
//             gameName: gameData.gameName?.gameName_enus
//         });

//         if (gameLaunchResult.success) {
//             // Update user balance if transfer was made
//             if (gameLaunchResult.balanceUpdated) {
//                 await User.updateOne(
//                     { userId: user.userId },
//                     {
//                         balance: gameLaunchResult.newBalance,
//                         last_game_id: gameData.g_code,
//                         last_played: new Date()
//                     }
//                 );

//                 // Emit balance update
//                 socketIO.emitBalanceUpdate(userId, gameLaunchResult.newBalance);
//             }

//             // Emit success events
//             socketIO.emitGameStatusChange(gameData.category_name, gameId, 'launched', 'Game launched successfully');

//             socketIO.emitGameActivity(gameData.category_name, {
//                 gameId: gameId,
//                 gameName: gameData.gameName?.gameName_enus,
//                 userId: userId,
//                 username: user.username,
//                 action: 'launched',
//                 timestamp: new Date()
//             });

//             return res.status(200).json({
//                 success: true,
//                 errCode: 0,
//                 errMsg: "Success",
//                 gameUrl: gameLaunchResult.gameUrl,
//                 balance: gameLaunchResult.newBalance || user.balance,
//                 gameName: gameData.gameName?.gameName_enus,
//                 provider: agent.company
//             });
//         } else {
//             socketIO.emitGameStatusChange(gameData.category_name, gameId, 'failed', gameLaunchResult.errMsg);
//             return res.status(400).json({
//                 success: false,
//                 errCode: gameLaunchResult.errCode,
//                 errMsg: gameLaunchResult.errMsg
//             });
//         }

//     } catch (error) {
//         console.error("❌ Launch Game Error:", error);

//         // Emit error status
//         if (gameData && gameId) {
//             socketIO.emitGameStatusChange(gameData.category_name, gameId, 'error', 'Server error during launch');
//         }

//         socketIO.emitSystemNotification('Game launch error occurred', 'error');

//         res.status(500).json({
//             success: false,
//             errCode: 500,
//             errMsg: "Server error."
//         });
//     }
// };

// // Additional APIs for better performance
// exports.getGamesFast = async (req, res) => {
//     try {
//         const {
//             category = 'ALL',
//             provider = 'ALL',
//             page = 1,
//             search = '',
//             sortBy = 'serial_number'
//         } = req.query;

//         const currentPage = Math.max(1, parseInt(page));
//         const limit = 24;
//         const skip = (currentPage - 1) * limit;

//         // Build simple query (no aggregation - much faster)
//         let query = { is_active: true };

//         if (category && category !== 'ALL') {
//             query.category_name = category;
//         }

//         if (provider && provider !== 'ALL') {
//             query.p_code = provider;
//         }

//         if (search) {
//             query.$or = [
//                 { 'gameName.gameName_enus': { $regex: search, $options: 'i' } },
//                 { 'g_code': { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Use simple find with select (optimized)
//         const [games, total] = await Promise.all([
//             GameListTable.find(query)
//                 .select('g_code gameName imgFileName p_code p_type serial_number is_hot isFeatured category_name')
//                 .sort({ [sortBy]: 1 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean(),
//             GameListTable.countDocuments(query)
//         ]);

//         res.json({
//             success: true,
//             data: games,
//             pagination: {
//                 page: currentPage,
//                 limit: limit,
//                 total: total,
//                 hasMore: skip + games.length < total
//             }
//         });

//     } catch (error) {
//         console.error("Fast games error:", error);
//         res.status(500).json({ success: false, error: "Server error" });
//     }
// };

// exports.getGameMetadata = async (req, res) => {
//     try {
//         const cacheKey = 'game_metadata';
//         const cached = cache.get(cacheKey);

//         if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//             return res.json(cached.data);
//         }

//         const [categories, providers, featuredCount, hotCount, totalGames] = await Promise.all([
//             Category.find({ id_active: true })
//                 .select('category_name category_code image')
//                 .lean(),

//             BetProviderTable.find({ id_active: true })
//                 .select('company providercode image_url type')
//                 .lean(),

//             GameListTable.countDocuments({ isFeatured: true, is_active: true }),
//             GameListTable.countDocuments({ is_hot: true, is_active: true }),
//             GameListTable.countDocuments({ is_active: true })
//         ]);

//         // Add game counts to providers
//         const providersWithCounts = await Promise.all(
//             providers.map(async (provider) => {
//                 const gameCount = await GameListTable.countDocuments({
//                     p_code: provider.providercode,
//                     is_active: true
//                 });
//                 return { ...provider, gameCount };
//             })
//         );

//         const responseData = {
//             success: true,
//             data: {
//                 categories,
//                 providers: providersWithCounts,
//                 counts: {
//                     featured: featuredCount,
//                     hot: hotCount,
//                     total: totalGames
//                 },
//                 socket: {
//                     connectedClients: socketIO.getConnectedClientsCount()
//                 }
//             }
//         };

//         // Cache metadata
//         cache.set(cacheKey, {
//             data: responseData,
//             timestamp: Date.now()
//         });

//         res.json(responseData);
//     } catch (error) {
//         console.error("Metadata error:", error);
//         res.status(500).json({ success: false, error: "Server error" });
//     }
// };

// // Game statistics
// exports.getGameStatistics = async (req, res) => {
//     try {
//         const stats = await GameListTable.aggregate([
//             {
//                 $match: { is_active: true }
//             },
//             {
//                 $group: {
//                     _id: '$category_name',
//                     totalGames: { $sum: 1 },
//                     featuredGames: { $sum: { $cond: ['$isFeatured', 1, 0] } },
//                     hotGames: { $sum: { $cond: ['$is_hot', 1, 0] } },
//                     providers: { $addToSet: '$p_code' }
//                 }
//             },
//             {
//                 $project: {
//                     category: '$_id',
//                     totalGames: 1,
//                     featuredGames: 1,
//                     hotGames: 1,
//                     providerCount: { $size: '$providers' },
//                     _id: 0
//                 }
//             },
//             {
//                 $sort: { totalGames: -1 }
//             }
//         ]);

//         const totalStats = await GameListTable.aggregate([
//             {
//                 $match: { is_active: true }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     totalGames: { $sum: 1 },
//                     totalFeatured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
//                     totalHot: { $sum: { $cond: ['$is_hot', 1, 0] } },
//                     uniqueProviders: { $addToSet: '$p_code' },
//                     uniqueCategories: { $addToSet: '$category_name' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     totalGames: 1,
//                     totalFeatured: 1,
//                     totalHot: 1,
//                     totalProviders: { $size: '$uniqueProviders' },
//                     totalCategories: { $size: '$uniqueCategories' }
//                 }
//             }
//         ]);

//         res.json({
//             success: true,
//             data: {
//                 categoryStats: stats,
//                 overallStats: totalStats[0] || {},
//                 socket: {
//                     connectedClients: socketIO.getConnectedClientsCount(),
//                     activeRooms: Object.keys(socketIO.getRoomsInfo()).length
//                 }
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching game statistics:', error);
//         res.status(500).json({
//             success: false,
//             error: "Internal server error"
//         });
//     }
// };

// // Clear cache endpoint (for admin)
// exports.clearCache = async (req, res) => {
//     try {
//         const previousSize = cache.size;
//         cache.clear();
//         res.json({
//             success: true,
//             message: `Cache cleared successfully`,
//             clearedEntries: previousSize
//         });
//     } catch (error) {
//         console.error('Error clearing cache:', error);
//         res.status(500).json({
//             success: false,
//             error: "Failed to clear cache"
//         });
//     }
// };

// // Helper functions
// function generateTransactionId() {
//     return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// }

// async function simulateGameLaunch(launchData) {
//     const { userId, gameId, provider, userBalance, gameName } = launchData;

//     try {
//         console.log(`🎮 Launching game: ${gameName} for user: ${userId}`);

//         // Simulate API call delay
//         await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

//         // Simulate balance transfer if user has balance
//         let balanceUpdated = false;
//         let newBalance = userBalance;

//         if (userBalance > 0) {
//             // Simulate successful transfer
//             balanceUpdated = true;
//             newBalance = 0; // Assuming full balance transfer

//             console.log(`💰 Balance transfer: ${userBalance} from ${userId} to game ${gameId}`);
//         }

//         // Generate game URL (simulate provider response)
//         const gameUrl = `https://${provider.company.toLowerCase()}.com/launch?` +
//             `game=${gameId}&user=${userId}&token=${generateTransactionId()}&` +
//             `operator=${provider.operatorcode}&provider=${provider.providercode}`;

//         // 95% success rate simulation
//         const success = Math.random() < 0.95;

//         if (success) {
//             return {
//                 success: true,
//                 gameUrl: gameUrl,
//                 balanceUpdated: balanceUpdated,
//                 newBalance: newBalance,
//                 transactionId: generateTransactionId()
//             };
//         } else {
//             return {
//                 success: false,
//                 errCode: 503,
//                 errMsg: "Game provider temporarily unavailable"
//             };
//         }
//     } catch (error) {
//         console.error('Error in simulateGameLaunch:', error);
//         return {
//             success: false,
//             errCode: 500,
//             errMsg: "Game launch simulation error"
//         };
//     }
// }



const crypto = require("crypto");
const axios = require('axios');
const User = require('../models/User');
const GameTable = require('../models/GameTable');
const BetProviderTable = require('../models/BetProviderTable');
const GameListTable = require('../models/GameListTable');
const Category = require('../models/Category');
const BettingHistory = require("../models/BettingHistory");
const catchAsync = require("../utils/catchAsync");



const featuredGame = catchAsync(async (req, res) => {
  try {
    const games = await GameListTable.find({ is_featured: true }).lean();
    res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// Utility functions
function randomStr() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateSignature(...args) {
  return crypto.createHash('md5').update(args.join('')).digest('hex').toUpperCase();
}

const fetchBalance = async (agent, username) => {
  try {
    const signature = crypto.createHash('md5').update(
      `${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${username}${agent.key}`
    ).digest('hex').toUpperCase();

    const params = {
      operatorcode: agent.operatorcode,
      providercode: agent.providercode,
      username: username,
      password: agent.auth_pass,
      signature
    };

    const apiUrl = `http://fetch.336699bet.com/getBalance.aspx`;
    const response = await axios.get(apiUrl, { params, headers: { 'Content-Type': 'application/json' }, responseType: 'json' });
    let parsedData = response.data;
    return parseFloat(parsedData.balance);
  } catch (error) {
    console.log("Error fetching balance:", error.message);
    return null;
  }
};


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

    // If no categories found
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

    // console.log("Normalized category g_types:", categoryGTypes);

    let providers = [];
    
    // Build provider filter based on the scenario
    const providerFilter = { id_active: true };
    
    if (categoryGTypes.length > 0) {
      if (providercode) {
        // Scenario 1: Both category_name and providercode provided
        // Get specific provider that matches the providercode and has matching g_type
        providerFilter.providercode = providercode;
        providerFilter.$or = [
          { g_type: { $in: categoryGTypes } },
          { g_type: { $in: categoryGTypes.map(type => [type]) } },
          { g_type: { $elemMatch: { $in: categoryGTypes } } }
        ];
      } else {
        // Scenario 2: Only category_name provided (no providercode)
        // Get all providers that match the category g_types
        providerFilter.$or = [
          { g_type: { $in: categoryGTypes } },
          { g_type: { $in: categoryGTypes.map(type => [type]) } },
          { g_type: { $elemMatch: { $in: categoryGTypes } } }
        ];
      }
    } else if (providercode) {
      // Scenario 3: Only providercode provided (no specific category)
      // Get the specific provider regardless of category
      providerFilter.providercode = providercode;
    } else {
      // Scenario 4: Neither provided - get all active providers
      // No additional filters needed
    }

    // Fetch providers based on the filter
    providers = await BetProviderTable.find(providerFilter)
      .select('name providercode g_type url image_url login_url type company id_active')
      .lean();

    // console.log("Found providers:", providers.length);

    // Create provider map - handle different g_type formats
    const providerMap = {};
    
    providers.forEach(provider => {
      let providerGTypes = [];
      
      // Handle different g_type formats
      if (Array.isArray(provider.g_type)) {
        providerGTypes = provider.g_type;
      } else if (typeof provider.g_type === 'string') {
        // Handle comma-separated strings or single values
        providerGTypes = provider.g_type.split(',').map(t => t.trim()).filter(t => t);
      } else if (provider.g_type) {
        providerGTypes = [String(provider.g_type)];
      }
      
      console.log(`Provider ${provider.name} g_types:`, providerGTypes);

      providerGTypes.forEach(gType => {
        if (!gType || typeof gType !== 'string') return;
        
        const normalizedGType = gType.trim().toLowerCase();
        if (!providerMap[normalizedGType]) {
          providerMap[normalizedGType] = [];
        }
        
        // Check for duplicates by providercode
        const exists = providerMap[normalizedGType].some(p => 
          p.providercode === provider.providercode
        );
        
        if (!exists) {
          providerMap[normalizedGType].push(provider);
        }
      });
    });

    console.log("Provider map keys:", Object.keys(providerMap));

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
      
      console.log(`Category ${category.category_name} (${normalizedCategoryGType}) found ${matchedProviders.length} providers`);

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
// Get games by category
exports.getGamesWithProvidersByCategory = async (req, res) => {
  try {
    const { category_name, page = 0, provider = [], gameName = "" } = req.query;
console.log("New-Games-with-Providers-By-Category",req.query);

    const limit = 24;
    const skip = page * limit;

    let query = { 
      g_type: category_name,
      is_active: true 
    };

    if (provider.length > 0 && !provider.includes('ALL')) {
      query.p_code = { $in: provider };
    }

    if (gameName) {
      query['gameName.gameName_enus'] = { $regex: gameName, $options: 'i' };
    }

    // let sortOptions = {};
    // switch (sortBy) {
    //   case "latest":
    //     sortOptions = { updatetimestamp: -1 };
    //     break;
    //   case "aZ":
    //     sortOptions = { 'gameName.gameName_enus': 1 };
    //     break;
    //   case "favorite":
    //     sortOptions = { isFeatured: -1 };
    //     break;
    //   default:
    //     sortOptions = { serial_number: 1 };
    // }
console.log("New-Games-with-Providers-By-Category  ---------------------query",query);
    const games = await GameListTable.find(query)
    //   .sort(sortOptions)
      .skip(skip)
      .limit(limit);
console.log("New-Games-with-Providers-By-Category",games);
    const total = await GameListTable.countDocuments(query);

    res.json({
      success: true,
      data: games,
      total,
      hasMore: games.length === limit
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ success: false, errMsg: "Server error" });
  }
};














//////////////////////////////////////////////////////////////
// exports.getGameListFilters = async (req, res) => {
// try {
//     // Get active providers
//     const providers = await BetProviderTable.find({ id_active: true });
    
//     // Get active categories
//     const categories = await Category.find({ id_active: true });
    
//     // Extract unique platforms from providers
//     const platforms = [...new Set(providers.map(p => p.name))].filter(Boolean);
    
//     // Extract unique game types from categories
//     const allGameTypes = categories.flatMap(cat => {
//       const types = [];
//       if (cat.g_type) types.push(cat.category_name);
//       // if (cat.gamelist && cat.gamelist.length > 0) {
//       //   cat.gamelist.forEach(game => {
//       //     if (game.g_type) types.push(game.g_type);
//       //   });
//       // }
//       return types;
//     });
    
//     const gameTypes = [...new Set(allGameTypes)].filter(Boolean);

//     // Calculate date range for filters (last 90 days)
//     const maxDate = new Date();
//     const minDate = new Date();
//     minDate.setDate(minDate.getDate() - 90);

//     res.json({
//       success: true,
//       data: {
//         platforms,
//         gameTypes,
//         dateRange: {
//           minDate: minDate.toISOString().split('T')[0],
//           maxDate: maxDate.toISOString().split('T')[0]
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching game providers:', error);
//     res.status(500).json({
//       success: false,
//       errMsg: 'Failed to fetch game providers'
//     });
//   }
// }
const getDateRange = (dateOption) => {
  const now = new Date();
  
  switch (dateOption) {
    case 'today':
      const today = new Date();
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0]
      };
    
    case 'last7days':
      const last7Start = new Date();
      last7Start.setDate(last7Start.getDate() - 6);
      return {
        startDate: last7Start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    
    case 'last30days':
      const last30Start = new Date();
      last30Start.setDate(last30Start.getDate() - 29);
      return {
        startDate: last30Start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    
    default:
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 6);
      return {
        startDate: defaultStart.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
  }
};

exports.getGameListFilters = async (req, res) => {
  try {
    console.log("Loading game list filters...");
    
    // Get unique platforms from BetProviderTable
    const platforms = await BetProviderTable.distinct('name', { id_active: true });
    
    // Get unique game types from Category
    const gameTypes = await Category.distinct('category_name', { id_active: true });
    
    // Get date range from betting history
    const dateRange = await BettingHistory.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$start_time' },
          maxDate: { $max: '$start_time' }
        }
      }
    ]);

    const result = {
      platforms: platforms || [],
      gameTypes: gameTypes || [],
      dateRange: dateRange.length > 0 ? {
        minDate: dateRange[0].minDate,
        maxDate: dateRange[0].maxDate
      } : { minDate: null, maxDate: null }
    };

    console.log("GamesProvidersPage category result", result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error loading filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load filters'
    });
  }
};

// Add this function at the top of your GameListControllers.js file
// Add this function at the top of your GameListControllers.js file



exports.getBettingRecords = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      platforms = [],
      gameTypes = [],
      settlement = 'settled',
      page = 1,
      limit = 2000,
      dateOption = 'last7days' // Add dateOption parameter
    } = req.query;
 const userId = req.body.userId;
    console.log('Betting records request:', {
      startDate, endDate, platforms, gameTypes, settlement, page, limit, dateOption
    });

    const member = userId;

    // Build filter query
    let filterQuery = { member };
    
    // Handle date filtering
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    // If no specific dates provided, use date option
    if (!startDate && !endDate && dateOption) {
      const dateRange = getDateRange(dateOption);
      finalStartDate = dateRange.startDate;
      finalEndDate = dateRange.endDate;
    }

    // Apply date filter
    if (finalStartDate && finalEndDate) {
      filterQuery.start_time = {
        $gte: new Date(finalStartDate),
        $lte: new Date(finalEndDate + 'T23:59:59.999Z')
      };
      console.log('Date filter applied:', { finalStartDate, finalEndDate });
    }

    // Settlement filter (status: 1 = settled, 0 = unsettled)
    if (settlement === 'settled') {
      filterQuery.status = 1;
    } else if (settlement === 'unsettled') {
      filterQuery.status = 0;
    }

    console.log('Final filter query:', JSON.stringify(filterQuery, null, 2));

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count first
    const totalRecords = await BettingHistory.countDocuments(filterQuery);
    console.log(`Total records found: ${totalRecords}`);
    const totalPages = Math.ceil(totalRecords / limitNum);

    console.log(`Found ${totalRecords} total records, page ${pageNum} of ${totalPages}`);

    // Get betting records with pagination
    const bettingRecords = await BettingHistory.find(filterQuery)
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(`Retrieved ${bettingRecords.length} records for processing`);

    // Enhanced records with game and category data
    const enhancedRecords = await Promise.all(
      bettingRecords.map(async (record) => {
        try {
          // Find game information from GameListTable
          const gameInfo = await GameListTable.findOne({
            $or: [
              { g_code: record.game_id },
              { externalgid: record.game_id },
              { externalmgid: record.game_id },
              
              // { g_code: record.product },
              { p_code: record.site }
            ]
          }).lean();
console.log('gameInfo :', gameInfo.category_name);
          // Find provider information
          const providerInfo = await BetProviderTable.findOne({
            $or: [
              // { name: record.site },
              { providercode: record.site },
              // { company: record.site }
            ]
          }).lean();

          const category = await Category.findOne({
            $or: [
              
              { category_name: gameInfo.category_name },
            ]
          }).lean();
console.log('gameInfo category :', category);
          let platform = record.site;
          let gameType = null;
          let categoryData = null;
console.log('gameInfo:', gameInfo);
          if (gameInfo) {
            if (gameInfo.category_name) {
              // If category_name is populated as an object
              if (typeof gameInfo.category_name === 'string') {
                gameType = gameInfo.category_name   || 'Unknown';
                categoryData = gameInfo.category_name;
              } else {
                // If it's just a string reference, find the category
                const category = await Category.findOne({
                  category_name: gameInfo.category_name
                }).lean();
                if (category) {
                  gameType = category.category_name;
                  categoryData = category;
                }
              }
            }
            
            // Fallback to gameInfo data
            // if (gameType === 'Unknown' && gameInfo.g_type) {
            //   gameType = gameInfo.g_type;
            // }
          }

          // Apply platform and game type filters if specified
          if (platforms.length > 0 && !platforms.includes(platform)) {
            return null;
          }

          if (gameTypes.length > 0 && !gameTypes.includes(gameType)) {
            return null;
          }

          const profitLoss = (record.p_win || 0) - (record.bet || 0);

          return {
            ...record,
            platform,
            gameType,
            categoryData,
            providerInfo,
            gameInfo,
            profitLoss,
            turnover: record.turnover || 0
          };
        } catch (error) {
          console.error('Error enhancing record:', error);
          // Return basic record if enhancement fails
          return {
            ...record,
            platform: record.site,
            gameType: gameInfo ? gameInfo.g_type : 'Unknown',
            profitLoss: (record.p_win || 0) - (record.bet || 0),
            turnover: record.turnover || 0
          };
        }
      })
    );

    // Filter out null records (filtered out by platform/game type)
    const filteredRecords = enhancedRecords.filter(record => record !== null);

    console.log(`After filtering: ${filteredRecords.length} records`);

    // Group records by date
    const groupedRecords = filteredRecords.reduce((acc, record) => {
      try {
        const dateKey = record.start_time ? 
          new Date(record.start_time).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
      
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            records: []
          };
        }
        
        acc[dateKey].records.push({
          _id: record.id || record._id,
          platform: record.platform,
          gameType: record.gameType,
          turnover: record.turnover,
          profitLoss: record.profitLoss,
          bet: record.bet,
          payout: record.payout,
          start_time: record.start_time,
          gameInfo: record.gameInfo,
          categoryData: record.categoryData
        });
      } catch (error) {
        console.error('Error grouping record:', error);
      }
      
      return acc;
    }, {});

    const groupedRecordsArray = Object.values(groupedRecords);

    // Sort date groups by date (newest first)
    groupedRecordsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    const response = {
      success: true,
      data: groupedRecordsArray,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalRecords,
        pages: totalPages
      },
      filters: {
        appliedDateRange: { finalStartDate, finalEndDate },
        appliedPlatforms: platforms,
        appliedGameTypes: gameTypes,
        settlement
      }
    };

    console.log(`Sending response with ${groupedRecordsArray.length} date groups`);

    res.json(response);

  } catch (error) {
    console.error('Error loading betting records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load betting records',
      error: error.message
    });
  }
};


exports.GetBettingCategory = async (req, res) => {
  try {
    // console.log("GetBettingProvider");

    const Category = await Category.find({});

    if (!Category || Category.length === 0) {
      return res.status(404).json({ errCode: 404, errMsg: "No providers found.", data: [] });
    }

    return res.status(200).json({ errCode: 200, errMsg: "Providers retrieved successfully.", data: Category });
  } catch (error) {
    console.error("GetBettingProvider Error:", error);
    return res.status(500).json({ errCode: 500, errMsg: "Internal server error." });
  }
};



exports.getBettingRecordDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BettingHistory.findOne({ 
      $or: [
        { id: id },
        { ref_no: id },
        { _id: id }
      ]
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Betting record not found'
      });
    }

    // Enhanced record with game data
    const gameInfo = await GameListTable.findOne({
      $or: [
        { g_code: record.game_id },
        { externalgid: record.game_id },
        { externalmgid: record.game_id }
      ]
    }).populate('category_name').lean();

    const providerInfo = await BetProviderTable.findOne({
      name: record.site
    }).lean();

    const enhancedRecord = {
      ...record.toObject(),
      gameInfo,
      providerInfo,
      profitLoss: (record.p_win || 0) - (record.bet || 0)
    };

    res.json({
      success: true,
      data: enhancedRecord
    });
  } catch (error) {
    console.error('Error loading betting record details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load betting record details'
    });
  }
};
///////////////////////////////////////////////////////////////

// Launch game player
exports.launchGamePlayer = async (req, res) => {
  try {
    const { userId, game_id, p_code, p_type } = req.body;
    if (!userId) return res.status(400).json({ errCode: 1, errMsg: "User not found." });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ errCode: 1, errMsg: "User not found." });

    const Newgame = await GameListTable.findOne({ g_code: game_id, p_code });
    if (!Newgame) return res.status(404).json({ errCode: 1, errMsg: "Game not found." });

    const agent = await GameListTable.aggregate([
      { $match: { g_code: game_id, p_code } },
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
          providercode: "$provider.providercode",
          operatorcode: "$provider.operatorcode",
          key: "$provider.key",
          auth_pass: "$provider.auth_pass",
          game_type: "$p_type"
        }
      }
    ]);

    if (!agent.length) return res.json({ errCode: 1, errMsg: "Agent not found." });

    const provider = agent[0];
    const amount = user.balance;

    // Refresh balance if user was playing another game
    if (user.last_game_id) {
      await refreshBalanceBefore(user.userId);
    }

    const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);

    const launchField = {
      operatorcode: provider.operatorcode,
      providercode: provider.providercode,
      username: user.userId,
      password: provider.auth_pass,
      type: Newgame.p_type,
      gameid: game_id,
      lang: "en-US",
      html5: 1,
      signature: generateSignature(
        provider.operatorcode,
        provider.auth_pass,
        provider.providercode,
        provider.game_type,
        user.userId,
        provider.key
      )
    };

    if (amount > 0) {
      const transferSignature = generateSignature(
        amount.toString(),
        provider.operatorcode,
        provider.auth_pass,
        provider.providercode,
        transId,
        0,
        user.userId,
        provider.key
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      const transferResponse = await fetchApi("makeTransfer.aspx", {
        operatorcode: provider.operatorcode,
        providercode: provider.providercode,
        username: user.userId,
        password: provider.auth_pass,
        referenceid: transId,
        type: 0,
        amount,
        signature: transferSignature
      });

      if (transferResponse.errCode === "0" && transferResponse.errMsg === "SUCCESS") {
        await GameTable.create({
          userId: user.userId,
          agentId: provider.providercode,
          gameId: Newgame.g_code,
          currencyId: user.currencyId,
          betAmount: amount,
          transactionId: transId
        });

        await User.updateOne(
          { userId: user.userId },
          { balance: 0, last_game_id: Newgame.g_code, agentId: provider.providercode }
        );

        await new Promise(resolve => setTimeout(resolve, 1000));
        const gameLaunchResponse = await fetchApi("launchGames.aspx", launchField);
        
        if (gameLaunchResponse.errCode !== "0") {
          return res.status(400).json({ errCode: gameLaunchResponse.errCode, errMsg: gameLaunchResponse.errMsg });
        }

        return res.status(200).json({ errCode: 0, errMsg: "Success", gameUrl: gameLaunchResponse.gameUrl });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    const fallbackGameLaunch = await fetchApi("launchGames.aspx", launchField);
    return res.status(200).json({ errCode: 0, errMsg: "Success", gameUrl: fallbackGameLaunch.gameUrl });

  } catch (error) {
    console.error("Launch Game Error:", error);
    res.status(500).json({ errCode: 500, errMsg: "Server error." });
  }
};

// Refresh balance
exports.refreshBalance = async (req, res) => {
  try {
    const { userId, agentId } = req.body;
    if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

    const user = await User.findOne({ userId: userId });
    if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });

    let balance = user.balance;
    if (!user.agentId) return res.status(200).json({ errCode: 1, errMsg: 'agent not found', balance });
    
    const game = await GameTable.findOne({ userId: user.userId, gameId: user.last_game_id, agentId: user.agentId || "" });
    if (!game) return res.json({ errCode: 0, errMsg: 'Success', balance });

    const agent = await BetProviderTable.findOne({ providercode: game.agentId });
    if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

    const username = user.userId;
    let amount = null;
    
    setTimeout(async () => {
      if (balance === 0) {
        amount = await fetchBalance(agent, username);
        if (amount === null) {
          return res.json({ errCode: 0, errMsg: 'Success', balance });
        }
      } else {
        return res.json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
      }

      if (amount && balance === 0 && amount !== balance && amount !== null) {
        balance += amount;
        await User.findOneAndUpdate(
          { userId: userId },
          { $set: { balance: parseFloat(balance) } },
          { new: true }
        );

        const transId = await `${randomStr(3)}${randomStr(3)}${randomStr(3)}`.substring(0, 8).toUpperCase();
        const signature = crypto.createHash('md5').update(
          `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
        ).digest('hex').toUpperCase();

        const params = {
          operatorcode: agent.operatorcode,
          providercode: agent.providercode,
          username: user.userId,
          password: agent.auth_pass,
          referenceid: transId,
          type: 1,
          amount: amount,
          signature
        };

        try {
          const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });
          
          if (refund.errMsg === "NOT_ALLOW_TO_MAKE_TRANSFER_WHILE_IN_GAME") {
            return res.status(500).json({ errCode: 0, errMsg: "Transaction not allowed while in game. Try again later.", balance });
          }

          const win = parseFloat(amount) - parseFloat(game.betAmount);
          if (!isNaN(win) && win !== 0 && win !== NaN) {
            await GameTable.findOneAndUpdate(
              { gameId: game.gameId },
              { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } },
              { new: true }
            );
          }
          
          return res.json({ errCode: 2, errMsg: 'Success user server updated, try again.', balance });
        } catch (transferError) {
          console.log("Transfer API Error:", transferError.message);
          return res.status(500).json({ errCode: 2, errMsg: 'Transfer API Error', balance });
        }
      }
    }, 1000);
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error', balance: 0 });
  }
};

// Helper function for API calls
const fetchApi = async (endpoint, data = {}) => {
  try {
    const baseURL = "http://gsmd.336699bet.com/";
    const url = `${baseURL}${endpoint}`;
    
    const config = {
      method: "GET",
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (config.method === "POST") {
      config.data = data;
    } else {
      config.params = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("API Request Failed:", error.message);
    return { errCode: 3, errMsg: "Network or API Error" };
  }
};

// Helper function to refresh balance before operations
const refreshBalanceBefore = async (userId) => {
  // Implementation for pre-refresh balance logic
  // This would be similar to refreshBalance but without the response object
};




