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

// const BettingHistory = require('../Models/BettingHistory');
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
  'Origin': process.env.CLIENT_URL || 'http://localhost:3000',
  'Cookie': cookieJar.getCookieStringSync('http://localhost:3000')
};












const fetchApi = async (endpoint, data = {}) => {

  console.log("data", data);
  try {
    const baseURL = "http://gsmd.336699bet.com/"; // Replace with actual API base URL
    const url = `${baseURL}${endpoint}`;
console.log("url", url);
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
