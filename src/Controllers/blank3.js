
// const axios = require("axios");
// const crypto = require("crypto");


// require("dotenv").config();



















const crypto = require('crypto');
const axios = require('axios');

const operatorCode = "rbdb";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
const providerCode = "JA";
const username = "samit1234";
const password = "asdf1234";
// const crypto = require("crypto");
const API_URL = "http://fetch.336699bet.com"; // Replace with actual log URL
const OPERATOR_CODE = "rcdi"; // Replace with your operator code
//const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; // Replace with your secret key

// Generate MD5 Signature




// const { HttpsProxyAgent } = require("https-proxy-agent");

// // Proxy Configuration
// const proxyUrl = "http://147.93.108.184:3128";
// const agent = new HttpsProxyAgent(proxyUrl);

// async function checkProxy() {
//     try {
//         const response = await axios.get("https://api.ipify.org?format=json", {
//             httpsAgent: agent,
//             timeout: 5000, // 5 seconds timeout
//         });

//         console.log("Proxy is working! Your IP:", response.data.ip);
//     } catch (error) {
//         console.error("Proxy is not working:", error.message);
//     }
// }

// checkProxy();




// // Function to generate MD5 signature
// function generateSignature(operatorCode, password, providerCode, type, username, secretKey) {
//   const rawString = operatorCode + password + providerCode + type + username + secretKey;
//   return crypto.createHash("md5").update(rawString).digest("hex").toUpperCase();
// }



// const gameIdplay = async () => {



//   const OPERATOR_CODE = "rbdb"
//   const username = "samit1234"
//   const password = "asdf1234"
//   const type = "SL"
//   const providerCode = "PR"
//   const gameId = "vswaysstrwild"
//   const lang = "en-US"
//   const html5 = "1"
//   const blimit = ""
//   const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"

//   if (!providerCode || !username || !password || !type) {
//     return res.status(400).json({ error: "Missing required parameters." });
//   }

//   // Generate the signature
//   const signature = generateSignature(OPERATOR_CODE, password, providerCode, type, username, SECRET_KEY);

//   // Construct API request URL
//   const requestUrl = `http://fetch.336699bet.com/launchGames.aspx?operatorcode=${OPERATOR_CODE}&providercode=${providerCode}&username=${username}&password=${password}&type=${type}&gameid=${gameId}&lang=${lang}&html5=${html5}&signature=${signature}&blimit=${blimit}`;

//   // Send request to external API
//   const response = await axios.get(requestUrl);
//   console.log(response.data);

// }



// gameIdplay()




















// async function markBettingHistory(tickets) {
//     try {
//         // Validate tickets format (ensure it's a comma-separated string)
//         if (!Array.isArray(tickets) || tickets.length === 0) {
//             throw new Error("Invalid ticket format. Provide an array of ticket IDs.");
//         }
//         const ticketString = tickets.join(",");

//         // Generate MD5 signature
//         const signature = crypto.createHash("md5")
//             .update(OPERATOR_CODE + SECRET_KEY)
//             .digest("hex")
//             .toUpperCase();

//         // Construct request body
//         const requestBody = {
//             ticket: ticketString,
//             operatorcode: OPERATOR_CODE,
//             signature: signature
//         };

//         console.log("Request Body:", requestBody); // Debugging log

//         // Send POST request
//         const response = await axios.post(`http://fetch.336699bet.com/markbyjson.ashx`, requestBody, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             }
//         });

//         console.log("Raw Response:", response.data); // Debugging log

//         // Handle API response
//         if (response.data.errCode !== "0") {
//             throw new Error(`API Error: ${response.data.errMsg}`);
//         }

//         return response.data; // Success response
//     } catch (error) {
//         console.error("Error marking betting history:", error.message);
//         return null;
//     }
// }

// // Example Usage
// markBettingHistory(["1", "2", "3", "4", "5", "6", "7", "8"]).then(data => console.log(data));

// // Example Usage


// // const crypto = require('crypto');
// // const axios = require('axios');

// // const operatorCode = "rbdb";

// const LOG_URL = "http://fetch.336699bet.com";

// const generateSignature = () => {
//     const signatureString = `${operatorCode}${SECRET_KEY}`;
//     return crypto.createHash("md5").update(signatureString).digest("hex").toUpperCase();
// };

// // Route to fetch betting history
// exports.getBettingHistory = async (req, res) => {
//     try {
//         const signature = generateSignature(operatorCode, SECRET_KEY);
//         const requestUrl = `${LOG_URL}/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${signature}`;

//         const response = await axios.get(requestUrl, { headers: { 'Accept': 'application/json' } });

//         if (response.data.errCode === "0") {
//             res.json({
//                 success: true,
//                 bettingHistory: JSON.parse(response.data.result),
//                 lastVersionKey: response.data.lastversionkey,
//             });
//         } else {
//             res.status(400).json({ success: false, message: response.data.errMsg });
//         }
//     } catch (error) {
//         console.error("Error fetching betting history:", error.message);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }


// Example Usage
// getBettingHistory(operatorCode)
//     .then(response => console.log(response))
//     .catch(error => console.error(error.message));














/* 


const fetchBettingHistory = async (req,res) => {
    try {
        const operatorCode = "rbdb";
        const secretKey = "9332fd9144a3a1a8bd3ab7afac3100b0";
        const signature = crypto.createHash("md5").update(operatorCode + secretKey).digest("hex").toUpperCase();

        const API_URL = `http://gsmd.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=${"0"}&signature=${signature}`;
        const response = await axios.get(API_URL);
        console.log("API Response:", API_URL);

        const bettingRecords = JSON.parse(response.data.result);
        console.log("Fetched Betting History:", bettingRecords);
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

            // console.log("Updated Betting History:", bettingRecords);
            res.json(bettingRecords);
            console.log("Betting history updated successfully");
        } else {
            console.error("Error fetching data:", bettingRecords);
        }
        setInterval(fetchBettingHistory, 60000);

    } catch (error) {
        console.error("Failed to fetch betting history:", error.message);
    }
};


fetchBettingHistory()

// // Run the fetch function every minute













// const crypto = require('crypto-js');
function generateSignaturen(operatorcode, secretKey) {
    const hash = crypto
    .createHash("md5")
    .update(operatorcode + secretKey)
    .digest("hex")
    .toUpperCase();
    return hash.toUpperCase();  // Convert to uppercase
  }
  
//   // Function to mark betting history
  async function markBettingHistory(operatorcode, secretKey, ticketIds) {
    const signature = generateSignaturen(operatorcode, secretKey);
    const logUrl = 'http://fetch.336699bet.com/';  // Replace with actual API base URL
    const url = `${logUrl}/markbyjson.aspx`;
  
    const body = {
      ticket: ticketIds.join(','),  // Convert array to comma-separated string
      operatorcode: operatorcode,
      signature: signature
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      console.log('Mark Betting Response:----------------', response);
      if (!response.ok) {
        throw new Error(`Failed to mark betting history. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Mark Betting Response:', data);
      return data;
    } catch (error) {
      console.error('Error marking betting history:', error);
    }
  }
  
//   // Example Usage:
  const operatorcode = 'rcdi';  // Replace with actual operator code
  const secretKey = 'ce624ff66a45d7557128c228fa51b396';  // Replace with actual secret key
  const ticketIds = [6,8,8,2,0,8,5,4,2,1,4,6,1,9,5,4,5,7];  // Replace with actual ticket IDs
  
  markBettingHistory(operatorcode, secretKey, ticketIds);












const getDailyWager = async (dateF, dateT, providerCode) => {
    try {
        const API_URL = "http://fetch.336699bet.com/getDailyWager.ashx";
const OPERATOR_CODE = "rbdb";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; // Replace with actual secret key
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
console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching daily wager history:", error.message);
        return { errCode: "500", errMsg: error.message };
    }
};

// // // Example usage:
getDailyWager("2025-03-15", "2025-03-20", "JD")
    .then((data) => console.log(data))
    .catch((err) => console.error(err));

















exports.fetchArchivedBettingHistory = async () => {


    try {
        const OPERATOR_CODE = "rbdb";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
        const API_URL = "http://gsmd.336699bet.com";

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



















function generateSignaturet(operatorcode,password, providercode, type , username , secret_key) {
//     const hash = crypto
//     .createHash("md5")
//     .update(operatorcode + password + providercode + type + username + secret_key)
//     .digest("hex")
//     .toUpperCase();
//     return hash.toUpperCase();  // Convert to uppercase
//   }
// // // Example usage:
// // exports.getGameList("GE", "en", "1", "yes")
// //     .then((data) => "console.log(data)")
// //     .catch((err) => console.error(err));










//     // function generateSignature(operatorCode, password, providerCode, type, username, secretKey) {
//     //     return crypto
//     //         .createHash("md5")
//     //         .update(operatorCode + password + providerCode + type + username + secretKey)
//     //         .digest("hex")
//     //         .toUpperCase();
//     // }
    
//     // Game providers configuration
//     // const providers = {
//     //     IG: { types: ["LK"], games: { "1": "HK", "2": "SSC" } },
//     //     S6: {
//     //         types: ["SL", "LC", "FH", "OT"],
//     //         games: {
//     //             SL: ["S6_FC"],
//     //             LC: ["S6_VENUS", "0"],
//     //             FH: ["S6_FC"],
//     //             OT: ["0"]
//     //         }
//     //     },
//     //     P3: {
//     //         types: ["SL", "LC"],
//     //         games: {
//     //             SL: ["0"],
//     //             LC: ["1_0"]
//     //         }
//     //     },
//     //     BD: {
//     //         types: ["SL", "CB"],
//     //         games: {
//     //             SL: ["bpgsltgmtab"],
//     //             CB: ["bpgbrtctab", "bpgbrtsstab", "bpgbrtptab", "bpgdrtgrtab", "bpgblkjktab", "bpgrlttab", "bpgcslgmtab"]
//     //         }
//     //     }
//     // };
    
//     // // Function to generate game launch URL
//     // function generateGameLaunchUrl(providerCode, type, gameId, username, lang) {
//     //     const OPERATOR_CODE = "rbdb";
//     //     const PASSWORD = "Asdf1234";
//     //     const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
    
//     //     // Validate provider
//     //     // if (!providers[providerCode]) {
//     //     //     return { error: "Invalid provider code" };
//     //     // }
    
//     //     // // Validate type
//     //     // if (!providers[providerCode].types.includes(type)) {
//     //     //     return { error: "Invalid game type for this provider" };
//     //     // }
    
//     //     // // Validate gameId
//     //     // if (!providers[providerCode].games[type].includes(gameId)) {
//     //     //     return { error: "Invalid game ID for this type" };
//     //     // }
    
//     //     // Generate signature
//     //     const signature = generateSignature(OPERATOR_CODE, PASSWORD, providerCode, type, username, SECRET_KEY);
    
//     //     // Construct game launch URL
//     //     const gameUrl = `http://gsmd.336699bet.com/launchGames.aspx?operatorcode=${OPERATOR_CODE}&providercode=${providerCode}&username=${username}&password=${PASSWORD}&type=${type}&lang=${lang}&gameid=${gameId}&signature=${signature}`;
//     //     console.log("launchUrl--------2",gameUrl);
//     //     return { launchUrl: gameUrl };
//     // }
    
//     // // Example usage
//     // const result = generateGameLaunchUrl("DG", "LC", "0", "samit1234", "en-US");
//     // console.log(result);





//     // function generateSignature(operatorCode, providerCode, username, secretKey) {
//     //     return crypto
//     //         .createHash("md5")
//     //         .update(operatorCode + providerCode + username + secretKey)
//     //         .digest("hex")
//     //         .toUpperCase();
//     // }
    
//     // Function to check Member Product Username
//   //   async function checkMemberProductUsername( operatorCode, providerCode, username, secretKey) {
//   //       try {
//   //           // Validate username length
//   //           if (username.length < 3 || username.length > 12) {
//   //               return { error: "Username must be between 3 and 12 characters." };
//   //           }
    
//   //           // Generate signature
//   //           const signature = generateSignature(operatorCode, providerCode, username, secretKey);
    
//   //           // Construct API request URL
//   //           const requestUrl = `http://gsmd.336699bet.com/checkMemberProductUsername.ashx?operatorcode=${operatorCode}&providercode=${providerCode}&username=${username}&signature=${signature}`;
            
//   //           console.log("Request URL:", requestUrl);
    
//   //           // Make GET request to API
//   //           const response = await axios.get(requestUrl, { headers: { Accept: "application/json" } });
    
//   //           // Return API response
//   //           return response.data;
//   //       } catch (error) {
//   //           return { error: error.message };
//   //       }
//   //   }
    
//   //   // Example usage
//   //  // const API_URL = "http://fetch.336699bet.com";  // Replace with actual API URL
//   //   const OPERATOR_CODE = "rbdb";
//   //   // const PROVIDER_CODE = "P3";
//   //   // const USERNAME = "samit57";
//   //   const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
    
//   //   checkMemberProductUsername( OPERATOR_CODE, "S3", "samit1234", SECRET_KEY)
//   //       .then((data) => console.log("Response:", data))
//   //       .catch((err) => console.error("Error:", err));








// // exports.kickPlayer = async ( req,res) => {
// //     try {
// //         const{ username } = req.body;
// //         // Validate inputs
// //         const OPERATOR_CODE = "rbdb";
// //         const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0"; 
// //         const password = "rbdbrbdb!"; 
// //         const providerCode = "JD"; 
// //         // const username = "samit57"; 
// //         if (!providerCode || providerCode !== "JD") {
// //             throw new Error("Currently, only provider code 'JD' is supported.");
// //         }
// //         if (!username || username.length < 3 || username.length > 12) {
// //             throw new Error("Username must be between 3 and 12 characters.");
// //         }
// //         if (!password || password.length > 12) {
// //             throw new Error("Password must be at most 12 characters.");
// //         }

// //         // Generate MD5 signature
// //         const signature = crypto
// //             .createHash("md5")
// //             .update(OPERATOR_CODE + password + providerCode + username + SECRET_KEY)
// //             .digest("hex")
// //             .toUpperCase();

// //         // Construct API request URL
// //         const url = `http://fetch.336699bet.com/kickPlayer.ashx?operatorcode=${OPERATOR_CODE}&providercode=${providerCode}&username=${username}&password=${password}&signature=${signature}`;

// //         // Fetch data from API
// //         const response = await axios.get(url, {
// //             headers: { "Content-Type": "application/json" },
// //         });
// // console.log(response.data)
// //         return response.data;
// //     } catch (error) {
// //         console.error("Error kicking player:", error.message);
// //         return { errCode: "500", errMsg: error.message };
// //     }
// // };




// exports.createMember = async (req, res) => {
//     try {
//         // console.log(req.body);
//         const { username } = req.body;
        
//         const operatorCode = "rcdi";
//         const secretKey = "ce624ff66a45d7557128c228fa51b396";
//         const apiUrl = `http://fetch.336699bet.com/createMember.aspx`;
        
//         const signature = crypto.createHash('md5').update(`${operatorCode}${username}${secretKey}`).digest('hex').toUpperCase();
        
//         const response = await axios.get(apiUrl, {
//             params: {
//                 operatorcode: operatorCode,
//                 username:username,
//                 signature: signature,
//             },
//         });
        
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// require("dotenv").config();
// const fs = require("fs");
// // const axios = require("axios");
// // const crypto = require("crypto");
// const BettingTable = require("../Models/BettingTable");
// // const { getOddsSports } = require("./ModelBettingController");

// // // Logging Functions
// // const logToFile = (filename, data) => {
// //     const logEntry = `${new Date().toISOString()} - ${data}\n`;
// //     fs.appendFileSync(filename, logEntry);
// // };

// // const logGameSession = (data) => {
// //     logToFile("game_sessions.log", JSON.stringify(data));
// //     console.log("Game session logged successfully.");
// // };

// // const logError = (error) => {
// //     logToFile("error.log", error.message);
// //     console.error("Error:", error.message);
// // };

// // Fetch Games API
// // exports.getGames = async (req, res) => {
// //     try {
// //         const html5 = "1";
// //         const PASSWORD = "Asdf1234";
// //         const type = "OT";
// //         const PROVIDER_CODE = "S6";
// //         const SECRET = "ce624ff66a45d7557128c228fa51b396";
// //         const username = "samit12";
// //         const OPERATOR_CODE = "rcdi";
// //         // const { OPERATOR_CODE, PROVIDER_CODE, SECRET, PASSWORD, API_URL } = process.env;
// //         // const username = "samit12"; // Can be dynamic based on req.user if auth is used
// //         // const type = "SB";
// //         // const html5 = "1";

// //         // Generate Signature
// //         const signatureString = `${OPERATOR_CODE}${PASSWORD}${PROVIDER_CODE}${type}${username}${SECRET}`;
// //         const signature = crypto.createHash("md5").update(signatureString).digest("hex").toUpperCase();

// //         // Construct API Request URL
// //         const requestUrl = `http://fetch.336699bet.com/launchGames.aspx?operatorcode=${OPERATOR_CODE}&providercode=${PROVIDER_CODE}&username=${username}&password=${PASSWORD}&type=${type}&gameid=0&lang=en-US&html5=${html5}&signature=${signature}`;
        
// //         console.log("Fetching game from:", requestUrl);
// //         const response = await axios.get(requestUrl);
// //         console.log("response:", response);
// //         if (response.data.errCode === "0") {
// //             logGameSession({ username, gameUrl: response.data.gameUrl });
// //             return res.json({ GameURL: response.data.gameUrl });
// //         } else {
// //             throw new Error(response.data.errMsg);
// //         }
// //     } catch (error) {
// //         logError(error);
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // // Fetch Active Sports Betting
// // exports.Sportsbetting = async (req, res) => {
// //     try {
// //         const sports = await BettingTable.find({ is_active: true, rel_type: "odds" });
// //         res.json(sports);
// //     } catch (error) {
// //         logError(error);
// //         res.status(500).json({ error: "Failed to fetch sports betting data" });
// //     }
// // };

// // // Update Betting Odds
// // exports.BettingUpdate = async (req, res) => {
// //     try {
// //         const sports = await BettingTable.find({ is_active: true, rel_type: "odds" });
// //         await Promise.all(sports.map(sport => updateJson(sport.rel_id, sport._id)));
// //         res.json({ message: "Betting odds updated", sports });
// //     } catch (error) {
// //         logError(error);
// //         res.status(500).json({ error: "Failed to update betting odds" });
// //     }
// // };

// // // Update Betting Data
// // const updateJson = async (key, id) => {
// //     try {
// //         const odds = await getOddsSports(key);
// //         let allEvents = [];

// //         if (odds.return) {
// //             allEvents = await Promise.all(
// //                 odds.output.map(async (o) => {
// //                     const event = await oddsEvent(o.sport_key, o.id);
// //                     return event.return ? event : null;
// //                 })
// //             );
// //         }

// //         const score = await oddsScores(key);
// //         const history = odds.return && odds.output.length > 0
// //             ? await oddsHistorical(key, odds.output[0].commence_time)
// //             : [];

// //         await BettingTable.updateOne(
// //             { _id: id },
// //             { history, json: { odds, event: allEvents.filter(Boolean), score, history } }
// //         );
// //     } catch (error) {
// //         logError(error);
// //     }
// // };

// // // Fetch Event by ID
// // exports.eventById = async (req, res) => {
// //     const { key, id } = req.params;
// //     try {
// //         const response = await axios.get(
// //             `https://api.the-odds-api.com/v4/sports/${key}/events/${id}/odds`,
// //             {
// //                 params: {
// //                     apiKey: process.env.BETTING_ODDS_API_KEY,
// //                     regions: process.env.BETTING_ODDS_REGION,
// //                     markets: "h2h,spreads",
// //                     oddsFormat: process.env.BETTING_ODDS_FORMAT,
// //                 },
// //             }
// //         );

// //         res.json({ return: true, message: "Sync Done", output: response.data });
// //     } catch (error) {
// //         logError(error);
// //         res.status(500).json({
// //             return: false,
// //             message: error.response?.data?.message || "Error fetching event",
// //         });
// //     }
// // };

// // // Log Game Session API
// // exports.logGameSession = async (req, res) => {
// //     try {
// //         const { cert, userId, key, returnUrl } = req.body;
// //         if (!cert || !userId || !key) {
// //             return res.status(400).json({ error: "Missing required fields" });
// //         }

// //         const gameUrl = `https://www.fwick7ets.xyz/apiWallet/player/YFG/login?cert=${cert}&userId=${userId}&key=${encodeURIComponent(key)}&returnUrl=${encodeURIComponent(returnUrl || "")}`;

// //         logGameSession({ cert, userId, key, returnUrl });
// //         res.json({ message: "Game session logged successfully", gameUrl });
// //     } catch (error) {
// //         logError(error);
// //         res.status(500).json({ error: "Failed to log game session" });
// //     }
// // };

// // // Test API Call
// // const testApiCall = async () => {
// //     try {
// //         const response = await axios.get("https://www.fwick7ets.xyz/apiWallet/player/YFG/login", {
// //             params: {
// //                 cert: "GZG8Z0CPgh50aOq6",
// //                 userId: "rcdisamit12",
// //                 key: "4q+vjeSw852+Vl7LCbrcLi4JPpSdSJHZnZUhbbirZs7ywlg4OYWDzfcGV5N9kukU",
// //                 returnUrl: "",
// //             },
// //         });

// //         console.log("Test API Response:", response.data);
// //     } catch (error) {
// //         logError(error);
// //     }
// // };

// // // Uncomment to run test API call
// // testApiCall();

// const getOddsSports = async (key) => {
//     // Example function to fetch sports odds, adapt as needed.
//     const response = await axios.get(`https://www.fwick7ets.xyz/apiWallet/player/YFG/login?cert=GZG8Z0CPgh50aOq6&userId=rcdisamit12&key=4q%2bvjeSw852%2bVl7LCbrcLhYQpQDatoCCiSdA31v9LU0CV9B%2fvT2RJUOwAIDx85y6&extension1=&extension2=&extension3=&extensionJson=&eventType=&returnUrl=","timestamp":"2025-03-14T01:19:52.592Z`, {
//         params: {
//             apiKey: process.env.BETTING_ODDS_API_KEY,
//             regions: process.env.BETTING_ODDS_REGION,
//             markets: 'h2h,spreads',
//             oddsFormat: process.env.BETTING_ODDS_FORMAT,
//         },
//     });
//     return response.data;
// };

// // Function to update betting events
// const updateBettingEvents = async (key, id) => {
//     try {
//         const odds = await getOddsSports(key);
//         let allEvents = [];

//         // Assuming 'odds' has some events to iterate over
//         if (odds.return) {
//             for (const o of odds.output) {
//                 // Assuming `oddsEvent` function is available for processing events
//                 const event = await oddsEvent(o.sport_key, o.id);
//                 if (event.return) {
//                     allEvents.push(event);
//                 }
//             }
//         }

//         // Assuming `oddsScores` and `oddsHistorical` are existing functions
//         const score = await oddsScores(key);
//         let history = [];
//         if (odds.return && odds.output.length > 0) {
//             history = await oddsHistorical(key, odds.output[0].commence_time);
//         }

//         // Update the BettingTable model with the latest data
//         await BettingTable.updateOne({ _id: id }, {
//             history: history,
//             json: { odds, event: allEvents, score, history }
//         });

//     } catch (error) {
//         console.error('Error updating betting events:', error);
//     }
// };
// // # API Credentials
// // OPERATOR_CODE=your_operator_code
// const PROVIDER_CODE="S6"
// const PASSWORD="Asdf1234"
// const SECRET="ce624ff66a45d7557128c228fa51b396"
// const API_URL="https://your-api-url.com"
// const USERNAME="sami4545"
// // const  API Configuration
// const BETTING_ODDS_API_KEY="your_odds_api_key"
// const BETTING_ODDS_REGION=["us","uk"]
// const BETTING_ODDS_FORMAT="decimal"

// // Function to log the game session
// const logGameSession = async (cert, userId, key, returnUrl) => {
//     const OPERATOR_CODE="rcdi"
//     const PROVIDER_CODE="WK"
// const PASSWORD="Asdf1234"
// const SECRET="ce624ff66a45d7557128c228fa51b396"
// const API_URL="https://your-api-url.com"
// const USERNAME="samit12"
// // const  API Configuration
// const BETTING_ODDS_API_KEY="your_odds_api_key"
// const BETTING_ODDS_REGION=["us","uk"]
// const BETTING_ODDS_FORMAT="decimal"
//     const signatureString = `${OPERATOR_CODE}${PASSWORD}${PROVIDER_CODE}${"SB"}${USERNAME}${SECRET}`;
//     const signature = crypto.createHash("md5").update(signatureString).digest("hex").toUpperCase();

//     const requestUrl = `http://gsmd.336699bet.com/launchGames.aspx?operatorcode=${OPERATOR_CODE}&providercode=${PROVIDER_CODE}&username=${USERNAME}&password=${PASSWORD}&type=SB&gameid=0&lang=en-US&html5=1&signature=${signature}`;
// console.log('Fetching game from:', requestUrl);
//     try {
//         const response = await axios.get(requestUrl);
//         console.log('Game URL:', response);
//         if (response.data.errCode === "0") {
//             const gameUrl = response.data.gameUrl;
//             console.log('Game URL:', gameUrl);

//             // Log game session to the BettingTable
//            const t= await BettingTable.create({
//                 rel_id: key,
//                 rel_type: 'game-session',
//                 staff_id: USERNAME,
//                 cetegory_id: 'game-category',  // Example category, adapt as needed
//                 json: JSON.stringify({ cert, USERNAME, gameUrl, timestamp: new Date().toISOString() }),
//                 is_active: true
//             });

//             console.log('Game session logged successfully',t);
//         } else {
//             console.error('Error launching game:', response.data.errMsg);
//         }
//     } catch (error) {
//         console.error('Error logging game session:', error);
//     }
// };

// Function to get odds for an event by ID
const getEventOddsById = async (key, userId, cert) => {
    try {
        const apiUrl = `https://www.fwick7ets.xyz/apiWallet/player/YFG/login`;
        const params = {
            cert,
            userId,
            key,
            extension1: "",
            extension2: "",
            extension3: "",
            extensionJson: "",
            eventType: "odds",
            returnUrl: "",
            timestamp: new Date().toISOString(), // Dynamically generate timestamp
            apiKey: process.env.BETTING_ODDS_API_KEY,
            regions: process.env.BETTING_ODDS_REGION,
            markets: "h2h,spreads",
            oddsFormat: process.env.BETTING_ODDS_FORMAT,
        };

        const response = await axios.get(apiUrl, { params });

        return { return: true, message: "Sync Done", output: response.data };
    } catch (error) {
        return { return: false, message: error.response?.data?.message || "Error", output: [] };
    }
};


exports.getEventOddsById = async (req, res) => {
    const { key, userId,cert } = req.params;
    const odds = await getEventOddsById(key, userId, cert);
    res.json(odds);
}

// API Route for updating betting events
exports.updateBettingEvents = async (req, res) => {
    const { key, id } = req.body;
    await updateBettingEvents(key, id);
    res.json({ message: 'Betting events updated' });
}

// API Route for logging game session
exports.logGameSessionone = async (req, res) => {
    const { cert, userId, key, returnUrl } = req.body;
    await logGameSession(cert, userId, key, returnUrl);
    res.json({ message: 'Game session logged successfully' });
}
const OPERATOR_CODE="rcdi"

exports.placeBet = async (req, res) => {
    try {
      const { userId, amount, gameId } = req.body;
  const SECRET_KEY="ce624ff66a45d7557128c228fa51b396"
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



// app.post("/api/apiWallet/:website/queryBetHistoryForAllStatus",
    
const queryBetHistoryForAllStatus = async () => {
    try {
        const apiServerHost = "www.fwick7ets.xyz"; // Update with correct API host
        const website = "apiWallet"; // Update with your website ID if needed
        const aiUrl = `https://${apiServerHost}/api/${website}/queryBetHistoryForAllStatus`;

        // Define query parameters
        const startDate = "2025-06-19 01:00"; // Ensure valid date format
        const endDate = "2025-06-19 22:00";
        const userId = "samit4545";
        const betStatus = -1;
        const isTxnDetail = 0; // Default to no transaction details
        const timeZone = 0; // Default IST timezone
        const pageNumber = 1;
        const reportType = 0;
        const agent = "rcdi";
        const returnUrl = "";

        // Ensure the date range does not exceed 35 days for a user & 24 hours for all users
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const diffDays = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24);

        if (userId && diffDays > 35) {
            throw new Error("User query date range cannot exceed 35 days.");
        } else if (!userId && diffDays > 1) {
            throw new Error("Query for all users cannot exceed 24 hours.");
        }

        // Define API request parameters
        const params = {
            cert: "GZG8Z0CPgh50aOq6",
            userId,
            startDate,
            endDate,
            betStatus,
            isTxnDetail,
            timeZone,
            pageNumber,
            reportType,
            agent,
            returnUrl
        };

        // Send API request with correct headers & format
        const response = await axios.post(aiUrl, qs.stringify(params), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        // Query database (MongoDB) with pagination
        const query = {
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
        };

        if (userId) query.userId = userId;
        if (betStatus !== -1) query.betStatus = betStatus;
        if (agent) query.agent = agent;

        const results = await Bet.find(query)
            .skip((pageNumber - 1) * 2000)
            .limit(2000);

        console.log("DB Results:", results);
        console.log("API Response:", response.data);

    } catch (error) {
        console.error("Error fetching bet history:", error.message);
    }
};
queryBetHistoryForAllStatus()

//   app.post("/api/apiWallet/:website/queryBetHistoryForAllStatus", 
    
    exports.queryBetHistoryForAllStatus = async (req, res) => {
    try {
      const { cert, userId, startDate, endDate, betStatus, pageNumber, reportType, agent } = req.body;
      
      let query = { startDate: { $gte: startDate }, endDate: { $lte: endDate } };
      if (userId) query.userId = userId;
      if (betStatus !== -1) query.betStatus = betStatus;
      if (agent) query.agent = agent;
  
      const results = await Bet.find(query).skip((pageNumber - 1) * 2000).limit(2000);
    //   res.json({ status: "1", totalCount: results.length, resultList: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  




















 */