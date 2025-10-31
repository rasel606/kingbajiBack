// // // Enhanced launchGamePlayer with socket updates
// // exports.launchGamePlayer = async (req, res) => {
// //   try {
// //     const { userId, game_id, p_code, p_type } = req.body;
// //     const socket = require('./socket/gameSocket');

// //     if (!userId) {
// //       return res.status(400).json({ errCode: 1, errMsg: "User not found." });
// //     }

// //     const user = await User.findOne({ userId });
// //     if (!user) {
// //       return res.status(404).json({ errCode: 1, errMsg: "User not found." });
// //     }

// //     const Newgame = await GameListTable.findOne({ g_code: game_id, p_code });
// //     if (!Newgame) {
// //       return res.status(404).json({ errCode: 1, errMsg: "Game not found." });
// //     }

// //     // Emit game launch started
// //     socket.emitGameStatusChange(Newgame.category_name, game_id, 'launching');

// //     const agent = await GameListTable.aggregate([
// //       { $match: { g_code: game_id, p_code } },
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
// //           game_type: "$p_type"
// //         }
// //       }
// //     ]);

// //     if (!agent.length) {
// //       return res.json({ errCode: 1, errMsg: "Agent not found." });
// //     }

// //     const provider = agent[0];
// //     const amount = user.balance;

// //     if (user.last_game_id) {
// //       await refreshBalancebefore(user.userId, agent);
// //     }

// //     const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);

// //     const launchField = {
// //       operatorcode: provider.operatorcode,
// //       providercode: provider.providercode,
// //       username: user.userId,
// //       password: provider.auth_pass,
// //       type: Newgame.p_type,
// //       gameid: game_id,
// //       lang: "en-US",
// //       html5: 1,
// //       signature: generateSignature(
// //         provider.operatorcode,
// //         provider.auth_pass,
// //         provider.providercode,
// //         provider.game_type,
// //         user.userId,
// //         provider.key
// //       )
// //     };

// //     if (amount > 0) {
// //       const transferSignature = generateSignature(
// //         amount.toString(),
// //         provider.operatorcode,
// //         provider.auth_pass,
// //         provider.providercode,
// //         transId,
// //         0,
// //         user.userId,
// //         provider.key
// //       );

// //       await new Promise(resolve => setTimeout(resolve, 1000));

// //       const transferResponse = await fetchApi("makeTransfer.aspx", {
// //         operatorcode: provider.operatorcode,
// //         providercode: provider.providercode,
// //         username: user.userId,
// //         password: provider.auth_pass,
// //         referenceid: transId,
// //         type: 0,
// //         amount,
// //         signature: transferSignature
// //       });

// //       if (transferResponse.errCode === "0" && transferResponse.errMsg === "SUCCESS") {
// //         await GameTable.create({
// //           userId: user.userId,
// //           agentId: provider.providercode,
// //           gameId: Newgame.g_code,
// //           currencyId: user.currencyId,
// //           betAmount: amount,
// //           transactionId: transId
// //         });

// //         await User.updateOne(
// //           { userId: user.userId },
// //           { balance: 0, last_game_id: Newgame.g_code, agentId: provider.providercode }
// //         );

// //         // Emit balance update
// //         socket.emitBalanceUpdate(userId, 0);

// //         await new Promise(resolve => setTimeout(resolve, 1000));
// //         const gameLaunchResponse = await fetchApi("launchGames.aspx", launchField);
        
// //         if (gameLaunchResponse.errCode !== "0") {
// //           // Emit failure status
// //           socket.emitGameStatusChange(Newgame.category_name, game_id, 'failed');
// //           return res.status(400).json({ 
// //             errCode: gameLaunchResponse.errCode, 
// //             errMsg: gameLaunchResponse.errMsg 
// //           });
// //         }

// //         // Emit success status
// //         socket.emitGameStatusChange(Newgame.category_name, game_id, 'launched');
// //         return res.status(200).json({ 
// //           errCode: 0, 
// //           errMsg: "Success", 
// //           gameUrl: gameLaunchResponse.gameUrl 
// //         });
// //       }
// //     }

// //     await new Promise(resolve => setTimeout(resolve, 1500));
// //     const fallbackGameLaunch = await fetchApi("launchGames.aspx", launchField);
    
// //     // Emit fallback launch status
// //     socket.emitGameStatusChange(Newgame.category_name, game_id, 'launched');
    
// //     return res.status(200).json({ 
// //       errCode: 0, 
// //       errMsg: "Success", 
// //       gameUrl: fallbackGameLaunch.gameUrl 
// //     });

// //   } catch (error) {
// //     console.error("Launch Game Error:", error);
    
// //     // Emit error status
// //     if (Newgame) {
// //       const socket = require('./socket/gameSocket');
// //       socket.emitGameStatusChange(Newgame.category_name, game_id, 'error');
// //     }
    
// //     res.status(500).json({ errCode: 500, errMsg: "Server error." });
// //   }
// // };


// // controllers/gameLaunchController.js
// const GameListTable = require('../Models/GameListTable');
// const User = require('../Models/User');
// const GameTable = require('../models/GameTable');

// // Enhanced launchGamePlayer with socket updates
// exports.launchGamePlayer = async (req, res) => {
//   let Newgame = null;
//   let game_id = null;
  
//   try {
//     const { userId, game_id: reqGameId, p_code, p_type } = req.body;
//     const socket = require('../socket/gameSocket');

//     if (!userId) {
//       return res.status(400).json({ errCode: 1, errMsg: "User not found." });
//     }

//     const user = await User.findOne({ userId });
//     if (!user) {
//       return res.status(404).json({ errCode: 1, errMsg: "User not found." });
//     }

//     game_id = reqGameId;
//     Newgame = await GameListTable.findOne({ g_code: game_id, p_code });
//     if (!Newgame) {
//       return res.status(404).json({ errCode: 1, errMsg: "Game not found." });
//     }

//     // Emit game launch started
//     socket.emitGameStatusChange(Newgame.category_name, game_id, 'launching');

//     const agent = await GameListTable.aggregate([
//       { $match: { g_code: game_id, p_code } },
//       {
//         $lookup: {
//           from: "betprovidertables",
//           localField: "p_code",
//           foreignField: "providercode",
//           as: "provider"
//         }
//       },
//       { $unwind: "$provider" },
//       {
//         $project: {
//           providercode: "$provider.providercode",
//           operatorcode: "$provider.operatorcode",
//           key: "$provider.key",
//           auth_pass: "$provider.auth_pass",
//           game_type: "$p_type"
//         }
//       }
//     ]);

//     if (!agent.length) {
//       socket.emitGameStatusChange(Newgame.category_name, game_id, 'failed');
//       return res.json({ errCode: 1, errMsg: "Agent not found." });
//     }

//     const provider = agent[0];
//     const amount = user.balance;

//     if (user.last_game_id) {
//       await refreshBalancebefore(user.userId, agent);
//     }

//     const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);

//     const launchField = {
//       operatorcode: provider.operatorcode,
//       providercode: provider.providercode,
//       username: user.userId,
//       password: provider.auth_pass,
//       type: Newgame.p_type,
//       gameid: game_id,
//       lang: "en-US",
//       html5: 1,
//       signature: generateSignature(
//         provider.operatorcode,
//         provider.auth_pass,
//         provider.providercode,
//         provider.game_type,
//         user.userId,
//         provider.key
//       )
//     };

//     if (amount > 0) {
//       const transferSignature = generateSignature(
//         amount.toString(),
//         provider.operatorcode,
//         provider.auth_pass,
//         provider.providercode,
//         transId,
//         0,
//         user.userId,
//         provider.key
//       );

//       await new Promise(resolve => setTimeout(resolve, 1000));

//       const transferResponse = await fetchApi("makeTransfer.aspx", {
//         operatorcode: provider.operatorcode,
//         providercode: provider.providercode,
//         username: user.userId,
//         password: provider.auth_pass,
//         referenceid: transId,
//         type: 0,
//         amount,
//         signature: transferSignature
//       });

//       if (transferResponse.errCode === "0" && transferResponse.errMsg === "SUCCESS") {
//         await GameTable.create({
//           userId: user.userId,
//           agentId: provider.providercode,
//           gameId: Newgame.g_code,
//           currencyId: user.currencyId,
//           betAmount: amount,
//           transactionId: transId
//         });

//         await User.updateOne(
//           { userId: user.userId },
//           { balance: 0, last_game_id: Newgame.g_code, agentId: provider.providercode }
//         );

//         // Emit balance update
//         socket.emitBalanceUpdate(userId, 0);

//         await new Promise(resolve => setTimeout(resolve, 1000));
//         const gameLaunchResponse = await fetchApi("launchGames.aspx", launchField);
        
//         if (gameLaunchResponse.errCode !== "0") {
//           // Emit failure status
//           socket.emitGameStatusChange(Newgame.category_name, game_id, 'failed');
//           return res.status(400).json({ 
//             errCode: gameLaunchResponse.errCode, 
//             errMsg: gameLaunchResponse.errMsg 
//           });
//         }

//         // Emit success status
//         socket.emitGameStatusChange(Newgame.category_name, game_id, 'launched');
        
//         // Emit game activity to category
//         socket.emitGameActivity(Newgame.category_name, {
//           gameId: game_id,
//           gameName: Newgame.gameName?.gameName_enus,
//           userId: userId,
//           action: 'launched',
//           timestamp: new Date()
//         });

//         return res.status(200).json({ 
//           errCode: 0, 
//           errMsg: "Success", 
//           gameUrl: gameLaunchResponse.gameUrl 
//         });
//       }
//     }

//     await new Promise(resolve => setTimeout(resolve, 1500));
//     const fallbackGameLaunch = await fetchApi("launchGames.aspx", launchField);
    
//     // Emit fallback launch status
//     socket.emitGameStatusChange(Newgame.category_name, game_id, 'launched');
    
//     return res.status(200).json({ 
//       errCode: 0, 
//       errMsg: "Success", 
//       gameUrl: fallbackGameLaunch.gameUrl 
//     });

//   } catch (error) {
//     console.error("Launch Game Error:", error);
    
//     // Emit error status
//     if (Newgame && game_id) {
//       const socket = require('../socket/gameSocket');
//       socket.emitGameStatusChange(Newgame.category_name, game_id, 'error');
//     }
    
//     res.status(500).json({ errCode: 500, errMsg: "Server error." });
//   }
// };

// // Helper functions
// function randomStr(length) {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

// function generateSignature(...params) {
//   return require('crypto')
//     .createHash('md5')
//     .update(params.join(''))
//     .digest('hex');
// }

// async function fetchApi(endpoint, data) {
//   // Implement your API fetch logic here
//   const response = await fetch(`${process.env.GAME_API_BASE_URL}/${endpoint}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });
//   return await response.json();
// }

// async function refreshBalancebefore(userId, agent) {
//   // Implement balance refresh logic
// }



const GameListTable = require('../Models/GameListTable');
const Category = require('../Models/Category');
const BetProviderTable = require('../Models/BetProviderTable');
const User = require('../Models/User');

// API 1: Get all game data (categories, providers, games, featured, hot games)


// API 2: Launch Game with real-time updates
exports.launchGame = async (req, res) => {
  let gameData = null;
  let gameId = null;
  
  try {
    const { userId, game_id, p_code, p_type } = req.body;
    const socket = require('../socket/gameSocket');

    // Input validation
    if (!userId || !game_id || !p_code) {
      return res.status(400).json({ 
        success: false, 
        errCode: 1, 
        errMsg: "Missing required fields: userId, game_id, p_code" 
      });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        errCode: 1, 
        errMsg: "User not found." 
      });
    }

    // Find game
    gameId = game_id;
    gameData = await GameListTable.findOne({ g_code: game_id, p_code });
    if (!gameData) {
      return res.status(404).json({ 
        success: false, 
        errCode: 1, 
        errMsg: "Game not found." 
      });
    }

    // Emit game launch started
    socket.emitGameStatusChange(gameData.category_name, gameId, 'launching');

    // Find provider/agent details
    const agent = await GameListTable.aggregate([
      { $match: { g_code: gameId, p_code } },
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
          game_type: "$p_type",
          company: "$provider.company"
        }
      }
    ]);

    if (!agent.length) {
      socket.emitGameStatusChange(gameData.category_name, gameId, 'failed');
      return res.status(404).json({ 
        success: false, 
        errCode: 1, 
        errMsg: "Game provider not found." 
      });
    }

    const provider = agent[0];
    const userBalance = user.balance;

    // Handle balance transfer if user has balance
    if (userBalance > 0) {
      const transactionId = generateTransactionId();
      
      // Simulate balance transfer (replace with actual provider API call)
      const transferSuccess = await simulateBalanceTransfer({
        userId,
        amount: userBalance,
        transactionId,
        provider
      });

      if (transferSuccess) {
        // Update user balance
        await User.updateOne(
          { userId: user.userId },
          { 
            balance: 0, 
            last_game_id: gameData.g_code, 
            agentId: provider.providercode 
          }
        );

        // Emit balance update
        socket.emitBalanceUpdate(userId, 0);
      }
    }

    // Launch game (simulate API call to game provider)
    const gameLaunchResult = await simulateGameLaunch({
      userId,
      gameId,
      provider,
      gameType: gameData.p_type
    });

    if (gameLaunchResult.success) {
      // Emit success status
      socket.emitGameStatusChange(gameData.category_name, gameId, 'launched');
      
      // Emit game activity
      socket.emitGameActivity(gameData.category_name, {
        gameId: gameId,
        gameName: gameData.gameName?.gameName_enus,
        userId: userId,
        action: 'launched',
        timestamp: new Date()
      });

      return res.status(200).json({
        success: true,
        errCode: 0,
        errMsg: "Success",
        gameUrl: gameLaunchResult.gameUrl,
        balance: 0 // Updated balance
      });
    } else {
      socket.emitGameStatusChange(gameData.category_name, gameId, 'failed');
      return res.status(400).json({
        success: false,
        errCode: gameLaunchResult.errCode,
        errMsg: gameLaunchResult.errMsg
      });
    }

  } catch (error) {
    console.error("Launch Game Error:", error);
    
    // Emit error status
    if (gameData && gameId) {
      const socket = require('../socket/gameSocket');
      socket.emitGameStatusChange(gameData.category_name, gameId, 'error');
    }
    
    res.status(500).json({ 
      success: false,
      errCode: 500, 
      errMsg: "Server error." 
    });
  }
};

// Helper functions
function generateTransactionId() {
  return `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);
}

function randomStr(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function simulateBalanceTransfer(transferData) {
  // Simulate API call to provider's transfer endpoint
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true; // Simulate success
}

async function simulateGameLaunch(launchData) {
  // Simulate API call to provider's game launch endpoint
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    gameUrl: `https://games-provider.com/launch?game=${launchData.gameId}&user=${launchData.userId}&token=${randomStr(20)}`,
    errCode: 0,
    errMsg: "SUCCESS"
  };
}