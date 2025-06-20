const User = require('../Models/User');
const crypto = require("crypto");
const GameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');
const GameListTable = require('../Models/GameListTable');
const Category = require('../Models/Category');
const moment = require('moment-timezone');
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar(); // <-- Add this line
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const BettingHistory = require('../Models/BettingHistory');
// const { HttpsProxyAgent } = require("https-proxy-agent");

// // Proxy Configuration
// const proxyAgent = new HttpsProxyAgent(`http://root:0000@147.93.108.184:3128`);

const fetchBalance = async (agent, username) => {
  try {
    const signature = crypto.createHash('md5').update(
      `${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${username}${agent.key}`
    ).digest('hex').toUpperCase();

    console.log("Generated Signature:", signature);

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

function randomStr() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}



function generateSignature(...args) {
  return crypto.createHash('md5').update(args.join('')).digest('hex').toUpperCase();
}





exports.refreshBalance = async (req, res) => {

  try {
    const { userId, agentId } = req.body;
    console.log(userId, agentId);
    if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });
    console.log(userId);
    const user = await User.findOne({ userId: userId });
    if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });
    console.log("user.userId:", user.userId);
    let balance = user.balance;
    if (!user.agentId) return res.status(200).json({ errCode: 1, errMsg: 'agent not found', balance });
    const game = await GameTable.findOne({ userId: user.userId, gameId: user.last_game_id, agentId: user.agentId || "" });
    console.log("game refresh", game, user.last_game_id, game.agentId);

    if (!game) return res.json({ errCode: 0, errMsg: 'Success', balance });

    const agent = await BetProviderTable.findOne({ providercode: game.agentId });
    console.log("agent refresh", agent);
    if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

    const username = user.userId;
    let amount = null;
    setTimeout(async () => {
      if (balance === 0) {
        amount = await fetchBalance(agent, username);
        if (amount === null) {
          console.log("amount", balance);
          return res.json({ errCode: 0, errMsg: 'Success', balance });
        }
      } else {
        return res.json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
      }
      const transId = await `${randomStr(3)}${randomStr(3)}${randomStr(3)}`.substring(0, 8).toUpperCase();
      console.log("Fetched Balance:", amount);


      if (amount  && balance === 0 && amount !== balance && amount !== null) {
        console.log((amount > 0 && balance === 0 && amount !== null));
        balance += amount;

        await User.findOneAndUpdate(
          { userId: userId },
          { $set: { balance: parseFloat(balance) } },
          { new: true }
        );

        console.log("Updated Balance-------------1:", User.balance);
      }


      const signature = crypto.createHash('md5').update(
        `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
      ).digest('hex').toUpperCase();

      console.log("Transaction ID:", transId);
      console.log("Signature:", signature);

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

      console.log("Transfer Params:", params);
      try {
        const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });
        console.log("Refund Response:", refund.data);

        if (refund.errMsg === "NOT_ALLOW_TO_MAKE_TRANSFER_WHILE_IN_GAME") {
          console.log("refund.errMsg:", refund.errMsg);
          res.status(500).json({ errCode: 0, errMsg: "Transaction not allowed while in game. Try again later.", balance });
        }

        // if (refund.innerCode === null && errMsg=== 'SUCCESS') {
        //     console.log("refund.innerCode:", refund.innerCode);
        //     console.log("Updated Balance -----------------3:", balance);
        //     console.log("Updated Balance -----------------1:", refund.data);
        //     return res.json({ errCode: 2, errMsg: 'Success user server updated, try again.', balance });
        // }
        return res.json({ errCode: 2, errMsg: 'Success user server updated, try again.', balance });
        // console.log("Refund Response:", refund.data);
        // return true
      } catch (transferError) {
        console.log("Transfer API Error:", transferError.message);
        return res.status(500).json({ errCode: 2, errMsg: 'Transfer API Error', balance });
      }
    }, 1000);
    const win = parseFloat(amount) - parseFloat(game.betAmount);
    console.log("Win Amount:", win);

    if (!isNaN(win) && win !== 0 && win !== NaN) {
      await GameTable.findOneAndUpdate(
        { gameId: game.gameId },
        { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } },
        { new: true }
      );
    }

    // } else {
    // //    await GameTable.deleteOne({ gameId: game.gameId })
    // }
    console.log("Updated Balance -----------------2 :", balance);
    // const updatedUser = await User.findOne({ userId: userId });
    // res.json({ errCode: 0, errMsg: 'Success user updated', balance: updatedUser.balance });

  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error', balance: 0 });
  }
};




















///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function randomStr() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

const refreshBalancebefore = async (userId) => {



  if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

  const user = await User.findOne({ userId: userId });
  if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });

  let balance = user.balance;
  const game = await GameTable.findOne({ userId: user.userId, gameId: user.last_game_id });
  console.log("game", game);

  if (!game) return balance

  const agent = await BetProviderTable.findOne({ providercode: user.agentId });
  //  console.log("agent", agent);
  if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

  const username = user.userId;
  let amount = null;
    setTimeout(async () => {
  if (balance === 0 && amount === null && amount !== 0) {
    amount = await fetchBalance(agent, username);
    if (amount === null) {
      return balance
    }
  } else {
    return balance
  }




  if (amount > 0 && balance === 0 && amount !== balance && amount !== null) {
    

      balance += amount;

      await User.findOneAndUpdate(
        { userId: userId },
        { $set: { balance: parseFloat(balance) } },
        { new: true }
      );

      console.log("Updated Balance:", balance);
      console.log("Updated Balance:", balance);

      const Kicksignature = crypto
        .createHash("md5")
        .update(agent.operatorcode + agent.auth_pass + agent.providercode + user.userId + agent.key)
        .digest("hex")
        .toUpperCase();


      const transId = `${randomStr(3)}${randomStr(3)}${randomStr(3)}`.substring(0, 8).toUpperCase();
      const signature = crypto.createHash('md5').update(
        `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
      ).digest('hex').toUpperCase();

      console.log("Transaction ID:", transId);
      console.log("Signature:", signature);

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

        setTimeout(async () => {
        const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });
        console.log("Refund Response:-----------------before", refund.data);
        console.log("Updated Balance:", balance);
        if (refund.errMsg === "NOT_ALLOW_TO_MAKE_TRANSFER_WHILE_IN_GAME") {
          console.log("refund.errMsg:", refund.errMsg);
          return balance;
        }

        const win = parseFloat(amount) - parseFloat(game.betAmount);
        console.log("Win Amount:", win);

        if (!isNaN(win) && win !== 0 && win !== NaN) {
          await GameTable.findOneAndUpdate(
            { gameId: game.gameId, },
            { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } },
            { new: true }
          );
        } else {
          await GameTable.deleteOne({ gameId: game.gameId })
        }

        const updatedUser = await User.findOne({ userId: userId });
        console.log("Updated Balance:", balance);
        console.log("updatedUser Balance:", updatedUser.balance);
        return updatedUser.balance;

      }, 1000);

      } catch (transferError) {
        console.log("Transfer API Error:", transferError.message);
        return res.status(500).json({ errCode: 2, errMsg: 'Transfer API Error', balance });
      }


  } else {
    return balance
  }
}, 1000);
}




// const updatedUser = await User.findOne({ userId: userId });
// return updatedUser.balance





// Configuration
const API_BASE_URL = 'http://fetch.336699bet.com/';
const SECURE_TLS_VERSION = 'TLSv1_2_method';
const PROXY_URL = process.env.HTTPS_PROXY || null; // Optional proxy

// Configure secure TLS agent
// const secureAgent = new https.Agent({
//   rejectUnauthorized: true,
//   secureProtocol: SECURE_TLS_VERSION,
//   ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256'
// });

// // Configure headers
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': process.env.CLIENT_URL || 'http://localhost:3000' || 'https://www.fwick7ets.xyz',
  'Cookie': cookieJar.getCookieStringSync('http://localhost:3000' || 'https://www.fwick7ets.xyz')
};












const fetchApi = async (endpoint, data = {}) => {

  console.log("data", data);
  try {
    const baseURL = "http://gsmd.336699bet.com/"; // Replace with actual API base URL
    const url = `${baseURL}${endpoint}`;
// console.log("url", url);
    const config = {
      method: "GET", // Default: POST
      url,
      headers: COMMON_HEADERS,
      // httpsAgent: PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : secureAgent,
    };

    if (config.method === "POST") {
      config.data = data;
    } else {
      config.params = data;
    }

    const response = await axios(config);

    console.log("response", response.data);
    return response.data
    // 
  } catch (error) {
    console.error("API Request Failed:", error.message);
    return { errCode: 3, errMsg: "Network or API Error" };
  }
};


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

    if (user.last_game_id) {
      await refreshBalancebefore(user.userId, agent); // optional validation
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
    // Fallback: No transfer, but still try to launch game
    const fallbackGameLaunch = await fetchApi("launchGames.aspx", launchField);
    return res.status(200).json({ errCode: 0, errMsg: "Success", gameUrl: fallbackGameLaunch.gameUrl });

  } catch (error) {
    console.error("Launch Game Error:", error);
    res.status(500).json({ errCode: 500, errMsg: "Server error." });
  }
};

function generateSignature(...args) {
  console.log("args:", args);
  return crypto.createHash("md5").update(args.join("")).digest("hex").toUpperCase();
}








exports.GetFeaturedGames = async (req, res) => {
  try {

    const featuredGames = await GameListTable.find({ isFeatured: false });
    console.log(featuredGames);
    res.json(featuredGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}








exports.GetBettingProvider = async (req, res) => {
  try {
    // console.log("GetBettingProvider");

    const provider = await BetProviderTable.aggregate([
      { $match: { id_active: true } },
      { $project: { _id: 0, providercode: 1,company:1 } }
    ]);

    if (!provider || provider.length === 0) {
      return res.status(404).json({ errCode: 404, errMsg: "No providers found.", data: [] });
    }

    return res.status(200).json({ errCode: 200, errMsg: "Providers retrieved successfully.", data: provider });
  } catch (error) {
    console.error("GetBettingProvider Error:", error);
    return res.status(500).json({ errCode: 500, errMsg: "Internal server error." });
  }
};
exports.GetBettingCategory = async (req, res) => {
  try {
    // console.log("GetBettingProvider");

    const provider = await Category.aggregate([
      { $match: { id_active: true } },
      { $project: { _id: 0, p_type:1,category_name:1 } }
    ]);

    if (!provider || provider.length === 0) {
      return res.status(404).json({ errCode: 404, errMsg: "No providers found.", data: [] });
    }

    return res.status(200).json({ errCode: 200, errMsg: "Providers retrieved successfully.", data: provider });
  } catch (error) {
    console.error("GetBettingProvider Error:", error);
    return res.status(500).json({ errCode: 500, errMsg: "Internal server error." });
  }
};








// exports.GetBettingHistoryByMember = async (req, res) => {
//   try {
//     const { filters, userId } = req.body;
//     const { product = [], site = [], date = 'today' } = filters;
//     const currentDate = new Date();
//     const match = {};
//     let dateRange = {};
//     const member = userId;

//     if (member) match.member = member;
//     if (Array.isArray(product) && product.length > 0) {
//       match.product = { $in: product };
//     }
//     if (Array.isArray(site) && site.length > 0) {
//       match.site = { $in: site };
//     }

//     // Date range logic
//     if (date === 'today') {
//       const startOfDay = new Date(currentDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       dateRange = { start_time: { $gte: startOfDay, $lte: currentDate } };
//     } else if (date === 'yesterday') {
//       const yesterday = new Date(currentDate);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
//       const endOfYesterday = new Date(startOfYesterday);
//       endOfYesterday.setHours(23, 59, 59, 999);
//       dateRange = { start_time: { $gte: startOfYesterday, $lte: endOfYesterday } };
//     } else if (date === 'last7days') {
//       const sevenDaysAgo = new Date(currentDate);
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//       sevenDaysAgo.setHours(0, 0, 0, 0);
//       dateRange = { start_time: { $gte: sevenDaysAgo, $lte: currentDate } };
//     } else {
//       const startOfDay = new Date(currentDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       dateRange = { start_time: { $gte: startOfDay, $lte: currentDate } };
//     }

//     match.start_time = dateRange.start_time;

//     // Aggregation pipeline
//     const bettingHistory = await BettingHistory.aggregate([
//       { $match: match },
//       // Join with GameListTable to get game and provider info
//       {
//         $lookup: {
//           from: "gamelisttables",
//           localField: "game_id",
//           foreignField: "g_code",
//           as: "gameInfo"
//         }
//       },
//       { $unwind: { path: "$gameInfo", preserveNullAndEmptyArrays: true } },
//       // Add formatted date field
//       {
//         $addFields: {
//           date: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$start_time"
//             }
//           },
//           category_name: "$gameInfo.g_type",
//           provider_code: "$gameInfo.p_code"
//         }
//       },
//       // Group by date, category and provider
//       {
//         $group: {
//           _id: {
//             date: "$date",
//             category_name: "$category_name",
//             provider_code: "$provider_code"
//           },
//           totalBet: { $sum: "$bet" },
//           totalTurnover: { $sum: "$turnover" },
//           totalPayout: { $sum: "$payout" },
//           totalRecords: { $sum: 1 },
//           // Store all raw records
//           rawRecords: { $push: "$$ROOT" }
//         }
//       },
//       // Project to clean up fields
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           category_name: "$_id.category_name",
//           provider_code: "$_id.provider_code",
//           totalBet: 1,
//           totalTurnover: 1,
//           totalPayout: 1,
//           totalRecords: 1,
//           rawRecords: 1
//         }
//       },
//       { $sort: { date: -1 } }
//     ]);

//       console.log("bettingHistory-all", bettingHistory);
//     // Get all categories for enrichment
//     const categories = await Category.find({});
//     const categoryMap = {};
//     categories.forEach(cat => {
//       categoryMap[cat.g_type] = cat;
//     });


//     console.log("bettingHistory-category", categoryMap);
//     // Process and enrich results
//     const finalResult = bettingHistory.map(item => {
//       // Get category info
//       const categoryInfo = categoryMap[item.category_name] || {};
      
//       // Process game records within this category and provider
//       const gamesMap = {};
//       item.rawRecords.forEach(record => {
//         const gameId = record.game_id;
//         if (!gamesMap[gameId]) {
//           gamesMap[gameId] = {
//             game_id: gameId,
//             gameName: record.gameInfo?.gameName || gameId,
//             records: [],
//             totalBet: 0,
//             totalTurnover: 0,
//             totalPayout: 0,
//             totalRecords: 0
//           };
//         }
        
//         gamesMap[gameId].records.push({
//           ref_no: record.ref_no,
//           bet: record.bet,
//           payout: record.payout,
//           start_time: record.start_time,
//           end_time: record.end_time,
//           status: record.status
//         });
        
//         gamesMap[gameId].totalBet += record.bet;
//         gamesMap[gameId].totalTurnover += record.turnover;
//         gamesMap[gameId].totalPayout += record.payout;
//         gamesMap[gameId].totalRecords++;
//       });

//       return {
//         date: item.date,
//         category_name: item.category_name,
//         provider_code: item.provider_code,
//         category_info: {
//           g_type: categoryInfo.g_type,
//           category_code: categoryInfo.category_code
//         },
//         totalBet: item.totalBet,
//         totalTurnover: item.totalTurnover,
//         totalPayout: item.totalPayout,
//         totalRecords: item.totalRecords,
//         games: Object.values(gamesMap)
//       };
//     });

//     // Group by date for final structure
//     const groupedByDate = finalResult.reduce((acc, item) => {
//       const dateGroup = acc.find(g => g.date === item.date);
//       if (dateGroup) {
//         // Check if category exists in this date group
//         const categoryGroup = dateGroup.categories.find(c => c.category_name === item.category_name);
//         if (categoryGroup) {
//           // Add provider to existing category
//           categoryGroup.providers.push({
//             provider_code: item.provider_code,
//             totalBet: item.totalBet,
//             totalTurnover: item.totalTurnover,
//             totalPayout: item.totalPayout,
//             totalRecords: item.totalRecords,
//             games: item.games
//           });
//         } else {
//           // Add new category with provider
//           dateGroup.categories.push({
//             category_name: item.category_name,
//             category_info: item.category_info,
//             providers: [{
//               provider_code: item.provider_code,
//               totalBet: item.totalBet,
//               totalTurnover: item.totalTurnover,
//               totalPayout: item.totalPayout,
//               totalRecords: item.totalRecords,
//               games: item.games
//             }]
//           });
//         }
//       } else {
//         // Create new date group with category and provider
//         acc.push({
//           date: item.date,
//           categories: [{
//             category_name: item.category_name,
//             category_info: item.category_info,
//             providers: [{
//               provider_code: item.provider_code,
//               totalBet: item.totalBet,
//               totalTurnover: item.totalTurnover,
//               totalPayout: item.totalPayout,
//               totalRecords: item.totalRecords,
//               games: item.games
//             }]
//           }]
//         });
//       }
//       return acc;
//     }, []);

//     res.json({ success: true, data: groupedByDate });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get betting history",
//       error: error.message
//     });
//   }
// };




exports.GetBettingHistoryByMember =  async (req, res) => {
  try {
    const { filters, userId } = req.body;
    const { providercode = [], g_type = [], date = 'today' } = filters;
    const currentDate = new Date();
    const match = {};
    let dateRange = {};
    const member = userId;

    if (member) match.member = member;
    if (Array.isArray(g_type) && g_type.length > 0) {
      match.product = { $in: g_type };
    }
    if (Array.isArray(providercode) && providercode.length > 0) {
      match.site = { $in: providercode };
    }

    // Date range logic
    if (date === 'today') {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      dateRange = { start_time: { $gte: startOfDay, $lte: currentDate } };
    } else if (date === 'yesterday') {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      dateRange = { start_time: { $gte: startOfYesterday, $lte: endOfYesterday } };
    } else if (date === 'last7days') {
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      dateRange = { start_time: { $gte: sevenDaysAgo, $lte: currentDate } };
    } else {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      dateRange = { start_time: { $gte: startOfDay, $lte: currentDate } };
    }

    match.start_time = dateRange.start_time;

    // First, get all matching betting history records
    const bettingRecords = await BettingHistory.find(match).lean().sort({ start_time: -1 });

    // Get all unique game_ids from the betting records
    const gameIds = [...new Set(bettingRecords.map(record => record.game_id))];

    // Get game information for these game_ids
    const games = await GameListTable.find({ g_code: { $in: gameIds } }).lean();

    // Create a map of game_id to game info
    const gameMap = {};
    games.forEach(game => {
      gameMap[game.g_code] = game;
    });

    // Get all unique g_types from the games
    const gameTypes = [...new Set(games.map(game => game.g_type || game.category_name))];

    // Get category information for these g_types
    const categories = await Category.find({ g_type: { $in: gameTypes } }).lean();

    // Create a map of g_type to category info
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.g_type] = category;
    });

    // Get all unique provider codes (site)
    const providerCodes = [...new Set(bettingRecords.map(record => record.site))];

    // Get provider information
    const providers = await BetProviderTable.find({ providercode: { $in: providerCodes } }).lean();

    // Create a map of providercode to provider info
    const providerMap = {};
    providers.forEach(provider => {
      providerMap[provider.providercode] = provider;
    });

    // Group records by date
    const groupedByDate = bettingRecords.reduce((acc, record) => {
      const dateStr = record.start_time.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(record);
      return acc;
    }, {});

    // Process each date group
    const result = Object.entries(groupedByDate).map(([date, records]) => {
      // Group records by site and product (g_type)
      const groupedBySiteProduct = records.reduce((acc, record) => {
        const gameInfo = gameMap[record.game_id] || {};
        const categoryInfo = categoryMap[gameInfo.g_type] || {};
        const providerInfo = providerMap[record.site] || {};
        
        const key = `${record.site}-${gameInfo.g_type}`;
        if (!acc[key]) {
          acc[key] = {
            site: record.site,
            product: gameInfo.g_type,
            records: [],
            totalBet: 0,
            totalTurnover: 0,
            totalPayout: 0,
            totalRecords: 0,
            category_name: categoryInfo.category_name || '',
            provider_code: providerInfo.providercode || record.site,
            provider_name: providerInfo.company || record.site
          };
        }
        
        acc[key].records.push(record);
        acc[key].totalBet += record.bet || 0;
        acc[key].totalTurnover += record.turnover || 0;
        acc[key].totalPayout += record.payout || 0;
        acc[key].totalRecords += 1;
        
        return acc;
      }, {});

      // Convert to array format
      const items = Object.values(groupedBySiteProduct).map(item => {
        const gameInfo = gameMap[item.records[0].game_id] || {};
        const categoryInfo = categoryMap[item.product] || {};
        
        // Group games by game_id
        const gamesMap = item.records.reduce((gamesAcc, record) => {
          if (!gamesAcc[record.game_id]) {
            const game = gameMap[record.game_id] || {};
            gamesAcc[record.game_id] = {
              game_id: record.game_id,
              game_name: game.gameName?.gameName_enus || record.game_id,
              totalBet: 0,
              totalTurnover: 0,
              totalPayout: 0,
              totalRecords: 0,
              records: []
            };
          }
          
          gamesAcc[record.game_id].totalBet += record.bet || 0;
          gamesAcc[record.game_id].totalTurnover += record.turnover || 0;
          gamesAcc[record.game_id].totalPayout += record.payout || 0;
          gamesAcc[record.game_id].totalRecords += 1;
          gamesAcc[record.game_id].records.push(record);
          
          return gamesAcc;
        }, {});

        return {
          date,
          category_name: categoryInfo.category_name || '',
          provider_code: item.provider_code,
          provider_name: item.provider_name,
          category_info: {
            g_type: categoryInfo.g_type,
            category_code: categoryInfo.category_code
          },
          totalBet: item.totalBet,
          totalTurnover: item.totalTurnover,
          totalPayout: item.totalPayout,
          totalRecords: item.totalRecords,
          games: Object.values(gamesMap),
          records: item.records // Include all raw records for details view
        };
      });

      return {
        date,
        items
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching betting history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch betting history',
      error: error.message
    });
  }
}











// exports.GetBettingHistoryByMember = async (req, res) => {
//   console.log("product", req.body);
//   try {
//     const { filters, userId } = req.body;
//     const { product = [], site = [], date = 'today' } = filters;
//     const currentDate = new Date();
//     const match = {};
//     let dateRange = {};
//     // const member = userId;

// console.log("product", product,date,site);
// console.log("product", req.body);

//     // if (member) match.member = member;
//     if (Array.isArray(product) && product.length > 0) {
//       match.product = { $in: product }; 
//     }
//     if (Array.isArray(site) && site.length > 0) {
//       match.site = { $in: site };
//     }

//     if (date === 'today') {
//       const startOfDay = new Date(currentDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       dateRange = {
//         start_time: { $gte: startOfDay, $lte: currentDate }
//       };
//     } else if (date === 'yesterday') {
//       const yesterday = new Date(currentDate);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
//       const endOfYesterday = new Date(startOfYesterday);
//       endOfYesterday.setHours(23, 59, 59, 999);
//       dateRange = {
//         start_time: { $gte: startOfYesterday, $lte: endOfYesterday }
//       };
//     } else if (date === 'last7days') {
//       const sevenDaysAgo = new Date(currentDate);
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 90); // includes today
//       sevenDaysAgo.setHours(0, 0, 0, 0);
//       dateRange = {
//         start_time: { $gte: sevenDaysAgo, $lte: currentDate }
//       };
//     } else {
//       const startOfDay = new Date(currentDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       dateRange = {
//         start_time: { $gte: startOfDay, $lte: currentDate }
//       };
//     }

//     match.start_time = dateRange.start_time;
// console.log("match", match);
//     const result = await BettingHistory.aggregate([
//       { $match: match },
//       {
//         $addFields: {
//           date: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$start_time"
//             }
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             date: "$date",
//             site: "$site",
//             // member: "$member",
//             product: "$product"
//           },
//           records: {
//             $push: {
//               ref_no: "$ref_no",
//               game_id: "$game_id",
//               bet: "$bet",
//               turnover: "$turnover",
//               payout: "$payout",
//               commission: "$commission",
//               p_share: "$p_share",
//               p_win: "$p_win",
//               status: "$status",
//               start_time: "$start_time",
//               end_time: "$end_time",
//               match_time: "$match_time",
//               bet_detail: "$bet_detail"
//             }
//           },
//           totalBet: { $sum: "$bet" },
//           totalTurnover: { $sum: "$turnover" },
//           totalPayout: { $sum: "$payout" },
//           totalRecords: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           site: "$_id.site",
//           // member: "$_id.member",
//           product: "$_id.product",
//           records: 1,
//           totalBet: 1,
//           totalTurnover: 1,
//           totalPayout: 1,
//           totalRecords: 1
//         }
//       },
//       { $sort: { date: -1, site: 1, member: 1 } }
//     ]);
// console.log("result", result);
//     res.json({ success: true, data: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get detailed betting history",
//       error: error.message
//     });
//   }
// };























////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const getDateRange = (rangeType) => {
//   const now = new Date();
//   let start, end;
// console.log("rangeType",rangeType);
//   switch (rangeType) {
//     case 'today':
//       start = moment().tz('Asia/Dhaka').startOf('day').toDate();
//       end =  moment().tz('Asia/Dhaka').endOf('day').toDate();;
//       break;
//     case 'yesterday':
//       end = new Date(now.setHours(0, 0, 0, 0));
//       start = new Date(end);
//       start.setDate(start.getDate() - 1);
//       break;
//     case 'last7Days':
//       end = new Date();
//       start = new Date();
//       start.setDate(start.getDate() - 7);
//       break;
//     default:
//       return null;
//   }

//   return { start, end };
// };



// exports.GetBettingHistoryByMember = async (req, res) => {
//   try {
//     const { member, product } = req.query;

//     const match = {};
//     if (member) match.member = member;
//     if (product) match.product = product;

//     const summary = await BettingHistory.aggregate([
//       { $match: match },
//       {
//         $addFields: {
//           date: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$end_time"
//             }
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             date: "$date",
//             product: "$product"
//           },
//           totalBet: { $sum: "$bet" },
//           totalTurnover: { $sum: "$turnover" },
//           totalPayout: { $sum: "$payout" },
//           records: {
//             $push: {
//               site: "$site",
//               member: "$member",
//               bet: "$bet",
//               turnover: "$turnover",
//               payout: "$payout",
//               end_time: "$end_time",
//               ref_no: "$ref_no"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           product: "$_id.product",
//           totalBet: 1,
//           totalTurnover: 1,
//           totalPayout: 1,
//           records: 1
//         }
//       },
//       { $sort: { date: 1, product: 1 } }
//     ]);

//     // Group by date
//     const groupedByDate = {};

//     summary.forEach(item => {
//       const { date, product, totalBet, totalTurnover, totalPayout, records } = item;

//       if (!groupedByDate[date]) groupedByDate[date] = [];

//       groupedByDate[date].push({
//         product,
//         totalBet,
//         totalTurnover,
//         totalPayout,
//         list: records
//       });
//     });

//     const transformed = Object.keys(groupedByDate).map(date => ({
//       date,
//       products: groupedByDate[date]
//     }));

//     res.json({ success: true, data: transformed });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to get betting history summary', error: err.message });
//   }
// };



// exports.GetBettingHistoryByMember = async (req, res) => {
//   try {
//     const { member, product } = req.query;

//     const now = new Date();
//     const past7Days = new Date();
//     past7Days.setDate(now.getDate() - 6); // Includes today

//     const match = {
//       // end_time: { $gte: past7Days }
//     };

//     if (member) match.member = member;
//     // if (product) match.product = product;

//     const summary = await BettingHistory.aggregate([
//       { $match: match },
//       {
//         $addFields: {
//           date: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$end_time"
//             }
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             date: "$date",
//             site: "$site",
//             product: "$product",
//             member: "$member"
//           },
//           totalBet: { $sum: "$bet" },
//           totalTurnover: { $sum: "$turnover" },
//           totalRecords: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           site: "$_id.site",
//           product: "$_id.product",
//           member: "$_id.member",
//           totalBet: 1,
//           totalTurnover: 1,
//           totalRecords: 1
//         }
//       },
//       { $sort: { date: 1, site: 1, product: 1, member: 1 } }
//     ]);

//     console.log("summary", summary);

//     // Transform the data to group by date with nested list
//     const groupedByDate = {};

//     summary.forEach(item => {
//       const { date, site, product, totalBet, totalTurnover, totalRecords } = item;

//       if (!groupedByDate[date]) {
//         groupedByDate[date] = [];
//       }
//       console.log("groupedByDate", groupedByDate);

//       groupedByDate[date].push({
//         site,
//         product,
//         totalBet,
//         totalTurnover,
//         totalRecords
//       });
//     });

//     const transformed = Object.keys(groupedByDate).map(date => ({
//       date,
//       list: groupedByDate[date]
//     }));
//     console.log("transformed", transformed);
//     res.json({ success: true, data: transformed,summary });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to get betting history summary', error: err.message });
//   }
// }




// exports.GetBettingHistoryALL = async (req, res) => {
//   const { member, site } = req.query;
//   const match = {
//     // end_time: { $gte: past7Days }
//   };

//   if (member) match.member = member;
//   if (site) match.site = site;

//   try {
//     const data = await BettingHistory.aggregate([
//       { $match: match },
//       {
//         $addFields: {
//           dateOnly: {
//             $dateToString: { format: "%Y-%m-%d", date: "$start_time" }
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             site: "$site",
//             // product: "$product",
//             date: "$dateOnly",
//             member: "$member"
//           },
//           totalBet: { $sum: "$bet" },
//           totalTurnover: { $sum: "$turnover" },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           site: "$_id.site",
//           // product: "$_id.product",
//           date: "$_id.date",
//           member: "$_id.member",
//           totalBet: 1,
//           totalTurnover: 1,
//           count: 1
//         }
//       },
//       {
//         $sort: { date: -1, site: 1 }
//       }
//     ]);

//     // const data = await BettingHistory.find({});

//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch grouped betting history", error: err.message });
//   }
// }

// exports.getBettingHistoryDetailed = async (req, res) => {
//   try {
//     const { member, site } = req.query;

//     const matchQuery = {};
//     if (member) matchQuery.member = member;
//     if (site) matchQuery.site = site;

//     // Fetch betting history
//     const bettingData = await BettingHistory.find(matchQuery).lean();

//     if (!bettingData.length) {
//       return res.json({ success: true, data: [] });
//     }

//     // Fetch all game data and map by g_code
//     const gameList = await GameListTable.find({}, 'g_code gameName').lean();
//     const gameMap = {};
//     gameList.forEach(game => {
//       gameMap[game.g_code] = game;
//     });

//     // Grouping by date + site + member
//     const grouped = {};

//     bettingData.forEach(entry => {
//       const date = new Date(entry.end_time).toISOString().split('T')[0];
//       const groupKey = `${date}|${entry.site}|${entry.member}`;

//       if (!grouped[groupKey]) {
//         grouped[groupKey] = {
//           date,
//           site: entry.site,
//           member: entry.member,
//           records: []
//         };
//       }

//       // Add matched game details
//       entry.game_details = gameMap[entry.game_id] || null;

//       grouped[groupKey].records.push(entry);
//     });

//     const result = Object.values(grouped);

//     res.json({ success: true, data: result });

//   } catch (err) {
//     console.error('Error fetching betting history:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: err.message
//     });
//   }
// };












// exports.launchGamePlayer = async (req, res) => {

//   try {
//     // Check if user is logged in

//     const { userId, game_id, is_demo, p_code, p_type } = req.body;
//     console.log("userId", userId, game_id, is_demo, p_code, p_type);
//     if (!userId) {

//       return res.status(400).json({ errCode: 1, errMsg: "User not found." });
//     }
//     const user = await User.findOne({ userId });
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     let amount = await refreshBalancebefore(user.userId);
//     const last_game_id = user.last_game_id;
//     console.log("amount", amount)

//     const Newgame = await GameListTable.findOne({ g_code: game_id, p_code: p_code, p_type: p_type });
//     console.log("Newgame", Newgame.p_type);
//     // Refresh balance if last game exists

//     const agent = await GameListTable.aggregate([
//       {
//         $match: { g_code: game_id, p_code: p_code }
//       },
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
//           // id: "$provider._id",
//           providercode: "$provider.providercode",
//           operatorcode: "$provider.operatorcode",
//           key: "$provider.key",
//           auth_pass: "$provider.auth_pass",
//           game_type: "$p_type"
//         }
//       }
//     ]);

//     // console.log("agent", agent)


//     console.log("agent", agent[0])








//     // Insufficient balance check
//     if (amount ) {
//       return res.json({ errCode: 2, errMsg: "Insufficient balance." });
//     }

//     // Fetch game and provider details using aggregation




//     if (!agent || agent.length === 0) {
//       return res.json({ errCode: 1, errMsg: "Agent not found." });
//     }

//     const provider = agent[0]


//     console.log("provider", provider);
//     let game_url;


//     const signature = generateSignature(
//       provider.operatorcode,
//       provider.auth_pass,
//       provider.providercode,
//       provider.game_type,
//       user.userId,
//       provider.key

//     )
//     const field = {
//       operatorcode: provider.operatorcode,
//       providercode: provider.providercode,
//       username: user.userId,
//       password: provider.auth_pass,
//       type: Newgame.p_type,
//       gameid: game_id,
//       lang: "en-US",
//       html5: 1,
//       signature: signature
//     };

//     // console.log("field - All", field);



//     if (user.balance > 0 && amount > 0) {
//       // Generate transaction ID
//       const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);


//       const signature = generateSignature(
//         amount.toString(),
//         provider.operatorcode,
//         provider.auth_pass,
//         provider.providercode,
//         transId,
//         0,
//         user.userId,
//         provider.key

//       )

//       await new Promise((resolve) => setTimeout(resolve, 800));
//       // console.log("signature blance", signature);
//       // Make transfer API call
//       const transferResponse = await fetchApi("makeTransfer.aspx", {
//         operatorcode: provider.operatorcode,
//         providercode: provider.providercode,
//         username: user.userId,
//         password: provider.auth_pass,
//         referenceid: transId,
//         type: 0,
//         amount: amount,
//         signature: signature
//       });



//       console.log("transferResponse -------------w", transferResponse);

//       if (transferResponse.errCode === "0" && transferResponse.errMsg === 'SUCCESS') {
//         console.log("new game_url -----------------------------------------------2", game_url);
//         console.log("amount-4", amount)
//         await GameTable.create({
//           userId: user.userId,
//           agentId: provider.providercode,
//           gameId: Newgame.g_code,
//           currencyId: user.currencyId,
//           betAmount: amount,
//           transactionId: transId
//         });

//         // Update user balance
//         await User.updateOne(
//           { userId: user.userId },
//           { balance: 0, last_game_id: Newgame.g_code, agentId: provider.providercode }
//           // {upsert: true}
//         );




//         await new Promise((resolve) => setTimeout(resolve, 2000));


//         game_url = await fetchApi("launchGames.aspx", field);
       

//         if (game_url.errCode !== "0") {
//           return res.status(400).json({ errCode: game_url.errCode, errMsg: game_url.errMsg });
//         }

//         const gameUrl = game_url.gameUrl;
//         console.log("gameUrl", gameUrl);








//         // Send the response back
//         return  res.json({ gameUrl, errCode: 0, errMsg: "Success" });
//         // return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });

//       }



//     } else {

//       game_url = await fetchApi("launchDGames.ashx", field);
//       console.log(game_url)
//       return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });
//     }


//   } catch (error) {
//     console.error("Launch Game Error:", error);
//     console.log("Launch Game Error:", error);
//     res.status(500).json({ errCode: 500, errMsg: "Server error." });
//   }

// }


