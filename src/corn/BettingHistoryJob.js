// app.js or cron/BettingHistoryJob.js
const cron = require('node-cron');
const axios = require('axios');
const md5 = require('md5');
const BettingHistory = require('../Models/BettingHistory');

const LOG_URL = 'http://fetch.336699bet.com';
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0';
const OPERATOR_CODE = 'rbdb'; // replace with actual code

const generateSignature = (operatorCode) => {
  return md5(operatorCode + SECRET_KEY).toUpperCase();
};

const fetchBettingHistory = async () => {
  const signature = generateSignature(OPERATOR_CODE);
  const url = `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`;
console.log(url);
  try {
    const response = await axios.get(url);
    if (response.data && response.data.result) {
      const bettingRecords = JSON.parse(response.data.result);
      for (const record of bettingRecords) {
        await BettingHistory.findOneAndUpdate(
          { ref_no: record.ref_no },
          { $set: record },
          { upsert: true, new: true }
        );
      }
      console.log(`[${new Date().toISOString()}] Betting history updated.`);
    } else {
      console.error('Error in response:', response.data.errMsg);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};

// 🔁 Schedule to run every minute
cron.schedule('* * * * *', fetchBettingHistory);


module.exports = { fetchBettingHistory };