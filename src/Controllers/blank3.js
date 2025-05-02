
const axios = require('axios');
const md5 = require('md5');
const BettingHistory = require('../Models/BettingHistory');


const LOG_URL = 'http://fetch.336699bet.com'; // Replace with your actual LOG_URL
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0'; // Replace with your secret key

// Function to generate signature
const generateSignature = (operatorCode) => {
  return md5(operatorCode + SECRET_KEY).toUpperCase();
};

// Fetch betting history
exports.BettingHistoryBet = async (req, res) => {
  // const operatorcode = 'xxx'; // Your operator code
  // const secretKey = 'your_secret_key'; // Your secret key
  // const versionkey = '0'; // Always use 0 as per the documentation

  // Generate signature

  const { operatorCode} = req.query;
  const signature = generateSignature(operatorCode);

  const url = `http://fetch.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${signature}`;

  try {
    // Send GET request to fetch betting history
    const response = await axios.get(url);
console.log(response.data);
    if (response.data && response.data.result) {
      const bettingRecords = JSON.parse(response.data.result);

      // Loop through each record and store/update in MongoDB
      for (const record of bettingRecords) {
        await BettingHistory.findOneAndUpdate(
          { ref_no: record.ref_no }, // Use ref_no as the unique identifier
          { $set: record },
          { upsert: true, new: true } // Insert if it doesn't exist, otherwise update
        );
      }
      res.json({ message: 'Betting history fetched and stored successfully' });
    } else {
      res.status(500).json({ message: 'Error fetching betting history', err: response.data.errMsg });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in fetching betting history', err: error.message });
  }
}



const qs = require('qs');

// Example API endpoints (replace with real ones)
// const PROVIDER_URLS = {
//   PG: "https://provider.pg/api/bet-history",
//   FG: "https://provider.fg/api/bet-history",
//   BI: "https://provider.bi/api/bet-history",
//   IG: "https://provider.ig/api/bet-history"
// };

// fetch bets by provider
exports.fetchBets = async (provider) => {
  let params = {};

  switch(provider) {
    case "PG":
      params.versionkey = "your_version_key";  // example
      break;
    case "FG":
      params.type = "fish"; // or 'fruit', 'poker', 'slot'
      break;
    case "BI":
      params.type = "FH"; // or 'LK', 'LC', 'SL'
      break;
    case "IG":
      const extra = {
        gamenoid: "1",
        beginid: "0",
        reportdateid: "0"
      };
      const base64 = Buffer.from(JSON.stringify(extra)).toString('base64');
      params.etc = encodeURIComponent(base64);
      params.type = "SC"; // or "HK"
      break;
    default:
      throw new Error("Unsupported provider: " + provider);
  }

  try {
    const response = await axios.get(PROVIDER_URLS[provider], {
      params,
      paramsSerializer: p => qs.stringify(p)
    });

    return response.data; // you need to match the real response structure
  } catch (error) {
    console.error(`Error fetching bets for ${provider}:`, error.message);
    return null;
  }
}






exports.GetDailyHistory = async (req, res) => {
    const { operatorcode, dateF, dateT, providercode } = req.query;
  
    if (!operatorcode || !dateF || !dateT || !providercode) {
      return res.status(400).json({ errCode: '400', errMsg: 'Missing required parameters' });
    }
  
    const signature = generateSignature(operatorcode);
  
    try {
      const response = await axios.get(`${LOG_URL}/getDailyWager.ashx`, {
        params: {
          operatorcode,
          dateF,
          dateT,
          providercode,
          signature,
        },
      });
  
      const data = response.data;
  
      if (data.errCode === '0') {
        return res.json(data);
      }
  
      return res.status(500).json({ errCode: data.errCode, errMsg: data.errMsg });
    } catch (error) {
      return res.status(500).json({ errCode: '500', errMsg: 'Internal server error' });
    }
  }
  

  
  


 exports.ArchivedHistory  =async (req, res) => {
    const { operatorcode} = req.query;
  
    if (!operatorcode ) {
      return res.status(400).json({ errCode: '400', errMsg: 'Missing required parameters' });
    }
  
    const signature = generateSignature(operatorcode);
    
    try {
      const response = await axios.get(`${LOG_URL}/fetchArchieve.aspx`, {
        params: {
          operatorcode,
          versionkey: '0', // Always use versionkey=0
          signature,
        },
      });
  
      const data = response.data;
  
      if (data.errCode === '0') {
        return res.json(data);
      }
  
      return res.status(500).json({ errCode: data.errCode, errMsg: data.errMsg });
    } catch (error) {
      return res.status(500).json({ errCode: '500', errMsg: 'Internal server error' });
    }
  }

  

exports.MarkBettingHistory = async (req, res) => {
    const { operatorcode} = req.query;
  const ticket = "1,2,3,4,5,6,7,8"
    if (!operatorcode ) {
      return res.status(400).json({ errCode: '400', errMsg: 'Missing required parameters' });
    }
  
    const signatureCalculated = generateSignature(operatorcode);
  
    // if (signatureCalculated !== signature) {
    //   return res.status(400).json({ errCode: '400', errMsg: 'Invalid signature' });
    // }
  
    try {
      const response = await axios.post(`${LOG_URL}/markbyjson.aspx`, {
        operatorcode,
        ticket,
        signature:signatureCalculated,
      });
  
      const data = response.data;
  
      if (data.errCode === '0') {
        // Update the betting history status in MongoDB
        await BettingHistory.updateMany(
          { ticketId: { $in: ticket.split(',') } },
          { $set: { marked: true } }
        );
  
        return res.json(data);
      }
  
      return res.status(500).json({ errCode: data.errCode, errMsg: data.errMsg });
    } catch (error) {
        console.log(error)
      return res.status(500).json({ errCode: '500', errMsg: 'Internal server error' });
    }
  }

  
 exports.MarkArchivedHistory = async (req, res) => {
    const { operatorcode, ticket, signature } = req.body;
  
    if (!operatorcode || !ticket || !signature) {
      return res.status(400).json({ errCode: '400', errMsg: 'Missing required parameters' });
    }
  
    const signatureCalculated = generateSignature(operatorcode);
  
    if (signatureCalculated !== signature) {
      return res.status(400).json({ errCode: '400', errMsg: 'Invalid signature' });
    }
  
    try {
      const response = await axios.post(`${LOG_URL}/markArchieve.ashx`, {
        operatorcode,
        ticket,
        signature,
      });
  
      const data = response.data;
  
      if (data.errCode === '0') {
        // Update the archived betting history status in MongoDB
        await BettingHistory.updateMany(
          { ticketId: { $in: ticket.split(',') } },
          { $set: { marked: true } }
        );
  
        return res.json(data);
      }
  
      return res.status(500).json({ errCode: data.errCode, errMsg: data.errMsg });
    } catch (error) {
      return res.status(500).json({ errCode: '500', errMsg: 'Internal server error' });
    }
  }
  