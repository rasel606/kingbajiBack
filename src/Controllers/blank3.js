
const axios = require("axios");
const crypto = require("crypto");


require("dotenv").config();



exports.fetchBettingHistory = async () => {
    try {
        const operatorCode = "rbdb";
        const secretKey = "9332fd9144a3a1a8bd3ab7afac3100b0";
        const signature = crypto.createHash("md5").update(operatorCode + secretKey).digest("hex").toUpperCase();

        const API_URL = `http://fetch.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${signature}`;
        const response = await axios.get(API_URL);
        console.log("API Response:", API_URL);
        if (response.data.errCode === "0") {
            const bettingRecords = JSON.parse(response.data.result);
            console.log("Fetched Betting History:", bettingRecords);
            //   for (const record of bettingRecords) {
            //     await BettingHistory.findOneAndUpdate(
            //       { betId: record.betId },
            //       { $set: record },
            //       { upsert: true }
            //     );
            //   }

            console.log("Betting history updated successfully");
        } else {
            console.error("Error fetching data:", bettingRecords);
        }
        setInterval(fetchBettingHistory, 60000);

    } catch (error) {
        console.error("Failed to fetch betting history:", error.message);
    }
};

// Run the fetch function every minute














const API_URL = "http://fetch.336699bet.com/getDailyWager.ashx";
const OPERATOR_CODE = "rbdb";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; // Replace with actual secret key

exports.getDailyWager = async (dateF, dateT, providerCode) => {
    try {
        // Validate date range (max 7 days)
        const fromDate = new Date(dateF);
        const toDate = new Date(dateT);
        const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

        if (diffDays > 7 || diffDays < 0) {
            throw new Error("Date range exceeds the maximum allowed 7 days or is invalid.");
        }

        // Generate MD5 signature
        const signature = crypto
            .createHash("md5")
            .update(OPERATOR_CODE + SECRET_KEY)
            .digest("hex")
            .toUpperCase();

        // Construct API request URL
        const url = `${API_URL}?operatorcode=${OPERATOR_CODE}&dateF=${dateF}&dateT=${dateT}&providercode=${providerCode}&signature=${signature}`;
        console.log(url)
        // Fetch data from API
        const response = await axios.get(url, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching daily wager history:", error.message);
        return { errCode: "500", errMsg: error.message };
    }
};

// Example usage:
exports.getDailyWager("2025-03-03", "2025-03-09", "JA")
    .then((data) => console.log(data))
    .catch((err) => console.error(err));

















exports.fetchArchivedBettingHistory = async (OPERATOR_CODE, SECRET_KEY) => {
    try {
        const API_URL = "http://fetch.336699bet.com";

        // Generate the signature
        const signature = crypto.createHash('md5')
            .update(OPERATOR_CODE + SECRET_KEY)
            .digest('hex')
            .toUpperCase();

        // API Endpoint
        const url = `${API_URL}/fetchArchieve.aspx?operatorcode=${OPERATOR_CODE}&versionkey=243093279155&signature=${signature}`;
        console.log("Request URL:", url);

        // Make GET request
        const response = await axios.get(url, {
            headers: { 'Accept': 'application/json' }
        });

        // Parse response
        if (response.data.errCode === "0") {
            console.log("Betting History Archive:", JSON.parse(response.data.result));
        } else {
            console.error("Error:", response.data.errMsg);
        }
    } catch (error) {
        console.error("Request failed:", error.message);
    }
};

// Example Usage
const OPERATOR_COD = "rbdb";
const SECRET_KE = "9332fd9144a3a1a8bd3ab7afac3100b0"; // Replace with actual secret key

(async () => {
    await exports.fetchArchivedBettingHistory(OPERATOR_COD, SECRET_KE);
})();











exports.getGameList = async (providerCode, lang, html5, reformatJson) => {
    try {
        if (!providerCode) {
            throw new Error("Provider code is required.");
        }
        const OPERATOR_CODE = "rbdb";
        const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
        // Generate MD5 signature
        const signature = crypto
            .createHash("md5")
            .update(OPERATOR_CODE.toLowerCase() + providerCode.toUpperCase() + SECRET_KEY)
            .digest("hex")
            .toUpperCase();

        // Construct API request URL
        const url = `http://fetch.336699bet.com/getGameList.ashx?operatorcode=${OPERATOR_CODE}&providercode=${providerCode}&lang=${lang}&html5=${html5}&reformatjson=${reformatJson}&signature=${signature}`;
        console.log(url)

        // Fetch data from API
        const response = await axios.get(url, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching game list:", error.message);
        return { errCode: "500", errMsg: error.message };
    }
};

// Example usage:
exports.getGameList("JD", "en", "1", "yes")
    .then((data) => "console.log(data)")
    .catch((err) => console.error(err));



exports.kickPlayer = async ( req,res) => {
    try {
        const{ username } = req.body;
        // Validate inputs
        const OPERATOR_CODE = "rbdb";
        const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; 
        const password = "rbdbrbdb!"; 
        const providerCode = "JD"; 
        // const username = "samit57"; 
        if (!providerCode || providerCode !== "JD") {
            throw new Error("Currently, only provider code 'JD' is supported.");
        }
        if (!username || username.length < 3 || username.length > 12) {
            throw new Error("Username must be between 3 and 12 characters.");
        }
        if (!password || password.length > 12) {
            throw new Error("Password must be at most 12 characters.");
        }

        // Generate MD5 signature
        const signature = crypto
            .createHash("md5")
            .update(OPERATOR_CODE + password + providerCode + username + SECRET_KEY)
            .digest("hex")
            .toUpperCase();

        // Construct API request URL
        const url = `http://fetch.336699bet.com/kickPlayer.ashx?operatorcode=${OPERATOR_CODE}&providercode=${providerCode}&username=${username}&password=${password}&signature=${signature}`;

        // Fetch data from API
        const response = await axios.get(url, {
            headers: { "Content-Type": "application/json" },
        });
console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error kicking player:", error.message);
        return { errCode: "500", errMsg: error.message };
    }
};




exports.createMember = async (req, res) => {
    try {
        // console.log(req.body);
        const { username } = req.body;
        const operatorCode = "rcdi";
        const secretKey = "ce624ff66a45d7557128c228fa51b396";
        const apiUrl = `http://fetch.336699bet.com/createMember.aspx`;
        
        const signature = crypto.createHash('md5').update(`${operatorCode}${username}${secretKey}`).digest('hex').toUpperCase();
        
        const response = await axios.get(apiUrl, {
            params: {
                operatorcode: operatorCode,
                username:username,
                signature: signature,
            },
        });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}





const fs = require('fs');
function logGameSession(data) {
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
    fs.appendFileSync('game_sessions.log', logEntry);
    console.log('Game session logged successfully.');
}

function logError(error) {
    const errorEntry = `${new Date().toISOString()} - ${error.message}\n`;
    fs.appendFileSync('error.log', errorEntry);
}

const PORT = 5000;
const LOG_URL = "http://fetch.336699bet.com";

exports.getGames = async (req, res) => {
    try {
        const html5 = "1";
        const password = "rbdbrbdb!";
        const type = "SL";
        const PROVIDER_CODE = "JD";
        const SECRET = "9332fd9144a3a1a8bd3ab7afac3100b0";
        const username = "samit1234";
        const OPERATOR_CODE = "rbdb";
        const gameid = "0_1501";

        // Generate the signature
        const signatureString = `${OPERATOR_CODE}${password}${PROVIDER_CODE}${type}${username}${SECRET}`;
        const signature = crypto.createHash("md5").update(signatureString).digest("hex").toUpperCase();

        // Construct the API request URL
        const requestUrl = `http://gsmd.336699bet.com/launchGames.aspx?operatorcode=${OPERATOR_CODE}&providercode=${PROVIDER_CODE}&username=${username}&password=${password}&type=${type}&gameid=${"0_1501"}&lang=${"en-US"}&html5=${html5}&signature=${signature}`;

        console.log("API Request URL:",requestUrl);

        // Call the API
        const response = await axios.get(requestUrl);

        // Check response
        if (response.data.errCode === "0") {
            // Open game URL
            console.log("Game URL:", response.data.gameUrl);
            logGameSession({ username, gameUrl: response.data.gameUrl, timestamp: new Date().toISOString() });
            res.json({ GameURL: response.data.gameUrl });  // Only pass game URL, not the entire response
        } else {
            logError(new Error(response.data.errMsg));
            console.error("Error:", response.data.errMsg);
        }
    } catch (error) {
        console.error("API Request Failed:", error);
        logError(error);
    }
};


const apiUrl = 'https://www.fwick7ets.xyz/apiWallet/player/YFG/login';
const params = {
    cert: 'GZG8Z0CPgh50aOq6',
    userId: 'rcdisamit12',
    key: '4q+vjeSw852+Vl7LCbrcLi4JPpSdSJHZnZUhbbirZs7ywlg4OYWDzfcGV5N9kukU',
    extension1: '',
    extension2: '',
    extension3: '',
    extensionJson: '',
    eventType: '',
    returnUrl: ''
};

axios.get(apiUrl, { params })
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });




















  
  // Example: Check User Balance
exports.checkBalance = async (req, res) => {
    try {
      const { userId } = req.query;
  
      const response = await axios.post(`${API_URL}/balance`, {
        operatorcode: OPERATOR_CODE,
        secret_key: SECRET_KEY,
        user_id: userId,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Error checking balance:", error.message);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  }









exports.placeBet = async (req, res) => {
    try {
      const { userId, amount, gameId } = req.body;
  
      const response = await axios.post(`${API_URL}/place_bet`, {
        operatorcode: OPERATOR_CODE,
        secret_key: SECRET_KEY,
        user_id: userId,
        amount,
        game_id: gameId,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Error placing bet:", error.message);
      res.status(500).json({ error: "Bet placement failed" });
    }
  }
  
  // 🔹 2️⃣ Deposit Funds
  exports.depositFunds = async (req, res) => {
    try {
      const { userId, amount } = req.body;
  
      const response = await axios.post(`${API_URL}/deposit`, {
        operatorcode: OPERATOR_CODE,
        secret_key: SECRET_KEY,
        user_id: userId,
        amount,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Error in deposit:", error.message);
      res.status(500).json({ error: "Deposit failed" });
    }
  }
  
  // 🔹 3️⃣ Withdraw Funds
 exports.withdrawFunds = async (req, res) => {
    try {
      const { userId, amount } = req.body;
  
      const response = await axios.post(`${API_URL}/withdraw`, {
        operatorcode: OPERATOR_CODE,
        secret_key: SECRET_KEY,
        user_id: userId,
        amount,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Error in withdrawal:", error.message);
      res.status(500).json({ error: "Withdrawal failed" });
    }
  }
  