
const axios = require('axios');
const md5 = require('md5');
const BettingHistory = require('../Models/BettingHistory');
const crypto = require('crypto');

const LOG_URL = 'http://fetch.336699bet.com'; // Replace with your actual LOG_URL
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0'; // Replace with your secret key
    const operatorcode = 'rbdb';
    // const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
// Function to generate signature
const generateSignature = (operatorCode) => {
  return md5(operatorCode + SECRET_KEY).toUpperCase();
};



const createSignature = ({ operatorcode, password, providercode, type, username, secret }) => {
  const rawString = operatorcode + password + providercode + type + username + secret;
  return crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();
};



// function generateSignature(operatorCode, providerCode, secretKey) {
//   const raw = operatorCode + providerCode + secretKey;
//   return crypto.createHash('md5').update(raw).digest('hex').toUpperCase();
// }

// Route to launch deep link app
exports.launchApp = async (req, res) => {
  try {
    const { providerCode, username, password } = req.query;
console.log(providerCode, username, password);

    // Validation
    if (!providerCode || !username || !password) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    if (username.length < 3 || username.length > 12) {
      return res.status(400).json({ error: 'Username must be between 3 and 12 characters' });
    }
const apiUrl = 'http://fetch.336699bet.com';
    const signature = generateSignature(operatorCode, providerCode, secretKey);

    const launchUrl = `${apiUrl}/launchAPP.ashx?operatorcode=${operatorCode}&providercode=${providerCode}&username=${username}&password=${password}&signature=${signature}`;
console.log(launchUrl);
    const response = await axios.get(launchUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error launching app:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Fetch betting history
// function generateSignature(operatorCode, secretKey) {
//   const raw = operatorCode + secretKey;
//   return crypto.createHash('md5').update(raw).digest('hex').toUpperCase();
// }
const operatorCode = 'rbdb';
    const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
    const logUrl = 'http://fetch.336699bet.com';
    const password = 'asdf1234';
    const providerCode = 'JD';
    const username  = 'samit12348';


// function generateSignature( ) {
//   const raw = operatorCode + secretKey;
//   return crypto.createHash('md5').update(raw).digest('hex').toUpperCase();
// }

exports.isPlayerIngame = async (req, res) => {
  try {
   

    // Build the signature
    const signatureRaw = operatorCode + password + providerCode + username + secretKey;
    const signature = crypto.createHash('md5').update(signatureRaw).digest('hex').toUpperCase();

    // Construct full request URL
    const fullUrl = `${logUrl}/isPlayerIngame.ashx?operatorcode=${operatorCode}&providercode=${providerCode}&username=${username}&password=${password}&signature=${signature}`;
console.log(fullUrl);
    const response = await axios.get(fullUrl);

    return res.json(response.data);
  } catch (error) {
    console.error('Error checking player in-game status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}















exports.BettingHistoryBet = async (req, res) => {
  try {
console.log("req");

    const operatorcode = 'rbdb';
    // const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
    const logUrl = 'http://fetch.336699bet.com';

    const versionkey = 0;
    const signature = generateSignature(operatorcode, secretKey);

    const apiUrl = `${logUrl}/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=${versionkey}&signature=${signature}`;
console.log(apiUrl);
    const response = await axios.get(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching betting history:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}


exports.GetDailyHistory = async (req, res) => {
  try {
    const { dateF, dateT, providercode } = req.query;
console.log(dateF,dateT,providercode);
    const operatorcode = 'rbdb';
    const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';

    if (!dateF || !dateT || !providercode) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Generate signature
    const signature = generateSignature(operatorcode, secretKey);

    // Prepare full API URL
    const apiUrl = `${LOG_URL}/getDailyWager.ashx?operatorcode=${operatorcode}&dateF=${dateF}&dateT=${dateT}&providercode=${providercode}&signature=${signature}`;
console.log(apiUrl);
    // Make API request
    const response = await axios.get(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching daily wager:', error.message);
    res.status(500).json({ error: 'Internal server error' });
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
exports.fetchBets = async (req, res) => {
  const provider = req.params.provider;
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






// exports.GetDailyHistory = async (req, res) => {
//     const { operatorcode, dateF, dateT, providercode } = req.query;
  
//     if (!operatorcode || !dateF || !dateT || !providercode) {
//       return res.status(400).json({ errCode: '400', errMsg: 'Missing required parameters' });
//     }
  
//     const signature = generateSignature(operatorcode);
  
//     try {
//       const response = await axios.get(`${LOG_URL}/getDailyWager.ashx`, {
//         params: {
//           operatorcode,
//           dateF,
//           dateT,
//           providercode,
//           signature,
//         },
//       });
  
//       const data = response.data;
  
//       if (data.errCode === '0') {
//         return res.json(data);
//       }
  
//       return res.status(500).json({ errCode: data.errCode, errMsg: data.errMsg });
//     } catch (error) {
//       return res.status(500).json({ errCode: '500', errMsg: 'Internal server error' });
//     }
//   }
  

  
  


 exports.ArchivedHistory  =async (req, res) => {
    // const { operatorcode} = req.query;
  
  
  
    const signature = generateSignature(operatorcode);
    
    try {
      const response = await axios.get(`${logUrl}/fetchArchieve.aspx`, {
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
  