const cron = require('node-cron');
const axios = require('axios');
const md5 = require('md5');
const BettingHistory = require('../models/BettingHistory');

const LOG_URL = 'http://fetch.336699bet.com';
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0';
const OPERATOR_CODE = 'rbdb';

const generateSignature = (operatorCode) => {
  return md5(operatorCode + SECRET_KEY).toUpperCase();
};



const PROVIDER_CODES = [ 'RE', 'ME', 'PR',   'SG'];

// Signature generator
// function generateSignature(operatorCode, secretKey) {
//   const hash = crypto.createHash('md5');
//   hash.update(operatorCode + secretKey);
//   return hash.digest('hex').toUpperCase();
// }

// Fetch + Save Logic
async function SpcialBettingHistoryJob() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const signature = generateSignature(OPERATOR_CODE);

  for (const provider of PROVIDER_CODES) {
    const url = `${LOG_URL}/getDailyWager.ashx?operatorcode=${OPERATOR_CODE}&dateF=${dateStr}&dateT=${dateStr}&providercode=${provider}&signature=${signature}`;
console.log("SpcialBettingHistoryJob url", url);
    try {
      const response = await axios.get(url);
      const { errCode, result, errMsg } = response.data;
console.log("SpcialBettingHistoryJob response", response.data);
      if (errCode !== '0') {
        console.warn(`⚠️ Provider SpcialBettingHistoryJob ${provider} error: ${errMsg}`);
        continue;
      }

      const records = JSON.parse(result);
      for (const record of records) {
        try {
          await BettingHistory.updateOne(
            { ref_no: record.ref_no },
            {
              $set: {
                site: record.site,
                product: record.product,
                member: record.member.toString(),
                game_id: record.game_id,
                start_time: new Date(record.start_time),
                match_time: new Date(record.match_time),
                end_time: new Date(record.end_time),
                bet_detail: record.bet_detail,
                turnover: Number(record.turnover),
                bet: Number(record.bet),
                payout: Number(record.payout),
                commission: Number(record.commission),
                p_share: Number(record.p_share),
                p_win: Number(record.p_win),
                status: Number(record.status),
              },
            },
            { upsert: true }
          );
        } catch (err) {
          console.error(`❌ SpcialBettingHistoryJob Error inserting ref_no ${record.ref_no}:`, err.message);
        }
      }

      console.log(`✅ Updated betting SpcialBettingHistoryJob history for provider ${provider}`);
    } catch (error) {
      console.error(`❌ Failed to fetch SpcialBettingHistoryJob from provider ${provider}:`, error.message);
    }
  }
}

// Cron Job: Runs every minute
cron.schedule('* * * * *', async () => {
  console.log(`⏱️ Running bettingSpcialBettingHistoryJob history fetch at ${new Date().toLocaleString()}`);
  await SpcialBettingHistoryJob();
});


module.exports = SpcialBettingHistoryJob;
