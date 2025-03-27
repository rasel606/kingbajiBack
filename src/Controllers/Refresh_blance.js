const User = require('../Models/User');
const crypto = require("crypto");
const GameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');
const GameListTable = require('../Models/GameListTable');
const Category = require('../Models/Category');



const { HttpsProxyAgent } = require("https-proxy-agent");

// Proxy Configuration
const proxyAgent = new HttpsProxyAgent(`http://root:0000@147.93.108.184:3128`);

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
    const game = await GameTable.findOne({ userId: user.userId, gameId: user.last_game_id, agentId: user.agentId });
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


      if (amount > 0 && balance === 0 && amount !== balance && amount !== null) {
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

  if (balance === 0 && amount === null && amount !== 0) {
    amount = await fetchBalance(agent, username);
    if (amount === null) {
      return balance
    }
  } else {
    return balance
  }



  // const params = {
  //   operatorcode: agent.operatorcode,
  //   providercode: agent.providercode,
  //   username: user.userId,
  //   password: agent.auth_pass,
  //   signature: Kicksignature
  // };

  // const kick = await axios.get('http://fetch.336699bet.com/kickPlayer.ashx', { params });
  // console.log("Kick Response:", kick.data);
  // console.log("Fetched Balance:", amount);

  if (amount > 0 && balance === 0 && amount !== balance && amount !== null) {
    setTimeout(async () => {

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

      } catch (transferError) {
        console.log("Transfer API Error:", transferError.message);
        return res.status(500).json({ errCode: 2, errMsg: 'Transfer API Error', balance });
      }





    }, 300);
  }


}

// const updatedUser = await User.findOne({ userId: userId });
// return updatedUser.balance



const fetchApi = async (endpoint, data = {}) => {

  console.log("data", data);
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

    console.log("response.data", response.data);
    return response.data
    // 
  } catch (error) {
    console.error("API Request Failed:", error.message);
    return { errCode: 3, errMsg: "Network or API Error" };
  }
};


exports.launchGamePlayer = async (req, res) => {

  try {
    // Check if user is logged in

    const { userId, game_id, is_demo, p_code, p_type } = req.body;
    console.log("userId", userId, game_id, is_demo, p_code, p_type);
    if (!userId) {

      return res.status(400).json({ errCode: 1, errMsg: "User not found." });
    }
    const user = await User.findOne({ userId });

    let amount = user.balance;
    const last_game_id = user.last_game_id;
    console.log("amount", amount)

    const Newgame = await GameListTable.findOne({ g_code: game_id, p_code: p_code, p_type: p_type });
    console.log("Newgame", Newgame);
    // Refresh balance if last game exists

    const agent = await GameListTable.aggregate([
      {
        $match: { g_code: game_id, p_code: p_code }
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









    const provider = agent[0]














    if (last_game_id) {


      const resBalance = await refreshBalancebefore(user.userId, agent);
      console.log("resBalance", resBalance)
      // if (!resBalance || resBalance.errCode !== 0) {
      //   return res.json(resBalance);
      // }
      // amount += resBalance.balance || 0;

      // console.log("amount-3", amount)
    }

    // Insufficient balance check
    if (amount < 1) {
      return res.json({ errCode: 2, errMsg: "Insufficient balance." });
    }

    // Fetch game and provider details using aggregation
    const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 10);
   


    if (!agent || agent.length === 0) {
      return res.json({ errCode: 1, errMsg: "Agent not found." });
    }

   


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
      type: Newgame.p_type,
      gameid: game_id,
      lang: "en-US",
      html5: 1,
      signature: signature
    };

    console.log("field - All", field);



    if (user.balance > 0) {
      // Generate transaction ID
      


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
      console.log("signature blance", signature);
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
      await GameTable.create({
        userId: user.userId,
        agentId: provider.providercode,
        gameId: Newgame.g_code,
        currencyId: user.currencyId,
        betAmount: amount,
        transactionId: transId
      });
  
      // Update user balance
      await User.updateOne(
        { userId: user.userId },
        { balance: 0, last_game_id: game_id, agentId: provider.providercode }
        // {upsert: true}
      );

      if (!transferResponse || transferResponse.errCode !== "0") {

        return res.json({ errCode: 2, errMsg: "Failed to load balance." });
      }


     

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
        type: Newgame.p_type,
        gameid: game_id,
        lang: "en-US",
        html5: 1,
        signature: signatureLunchGame
      };
      console.log("field:", field);



      game_url = await fetchApi("launchGames.aspx", field);

      if (game_url.errCode !== "0") {
        return res.status(400).json({ errCode: game_url.errCode, errMsg: game_url.errMsg });
      }

      const gameUrl = game_url.gameUrl;
      console.log("gameUrl", gameUrl);

      // Extract cert and key from the URL using regex
      const certMatch = gameUrl.match(/cert=([^&]+)/);
      const keyMatch = gameUrl.match(/key=([^&]+)/);

      if (!certMatch && !keyMatch && game_id !== 0) {
        return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });
      }

      // Assign extracted values correctly
     // Extract cert and key without re-encoding
     const cert = decodeURIComponent(certMatch[1]);
     const key = decodeURIComponent(keyMatch[1]);
const newuser = provider.operatorcode + userId
      console.log("newuser:", newuser);
      console.log("Extracted cert:", cert);
      console.log("Extracted key:", key);

      // Define the AI wallet API URL
      

       const aiUrl = "https://www.fwick7ets.xyz/apiWallet/player/YFG/login";
    
            const params = {
                cert,
                userId: newuser,
                key: encodeURIComponent(key).replace(/%20/g, "+"),
                extension1: "",
                extension2: "",
                extension3: "",
                extensionJson: "",
                eventType: "",
                returnUrl: "http://localhost:3000/"
            };
    
            // Store user session in cookies
            
    

      // Make the API request
      // const queryParams = new URLSearchParams(params);
      // // Make the request with the fully constructed URL
      // const formData = new URLSearchParams(params).toString();
      
 
      
      // Make the API request with corrected headers and params
      const respo = await axios({
        method: 'GET', // or 'POST' based on API requirements
        url: aiUrl,
        params,
        httpsAgent: proxyAgent, // ✅ Ensure agent is an object, not an array
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://kingbaji.live/",
          "Origin": "https://kingbaji.live/",
          "Cookie": req.headers.cookie // Forward client's cookies
      }
        ,credentials: 'include' 
      })

      const cookies = respo.headers["set-cookie"];
        if (cookies) {
            // Send cookies to the client
            cookies.forEach(cookie => {
                res.setHeader("Set-Cookie", cookie);
            });
        }

      console.log(respo)

      // Send the response back
      return res.json({
        errCode: 0,
        errMsg: "Success",
        gameUrl, // The game URL
        sessionData: {
          userId: newuser,
          cert,
          key: encodeURIComponent(key).replace(/%20/g, "+"),
          returnUrl: "http://localhost:3000/"
        }
      });
      // return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });





    } else {

      game_url = await fetchApi("launchDGames.ashx", field);
      console.log(game_url)
      return res.json(game_url || { errCode: 2, errMsg: "Failed to load API." });
    }


  } catch (error) {
    console.error("Launch Game Error:", error);
    console.log("Launch Game Error:", error);
    res.status(500).json({ errCode: 500, errMsg: "Server error." });
  }

}

function generateSignature(...args) {
  console.log("args:", args);
  return crypto.createHash("md5").update(args.join("")).digest("hex").toUpperCase();
}




// Helper function to set login cookies
const setLoginCookies = (res, user) => {
  const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    maxAge: 60 * 60 * 1000, // 1 hour expiration
  };

  res.cookie('userId', user.userId, cookiesOptions);
  res.cookie('userKey', user.key, cookiesOptions);

  // Set any other necessary cookies here
};

// Helper function to send webhook notifications
const sendWebhook = async (data) => {
  try {
    const webhookUrl = 'http://localhost:5000/webhook'; // Replace with actual webhook URL
    // const response = await axios.post(webhookUrl, data);
    console.log('Webhook sent successfully:');
  } catch (error) {
    console.error('Error sending webhook:', error.message);
  }
};

// Helper function to generate signature



