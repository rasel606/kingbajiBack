const cron = require('node-cron');
const axios = require('axios');
const md5 = require('md5');
const BettingHistory = require('../Models/BettingHistory');

const LOG_URL = 'http://fetch.336699bet.com';
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0';
const OPERATOR_CODE = 'rbdb';

const generateSignature = (operatorCode) => {
  return md5(operatorCode + SECRET_KEY).toUpperCase();
};
console.log('BettingHistoryJob cron started');
const BettingHistoryJob = async () => {
  const signature = generateSignature(OPERATOR_CODE);

  try {
    // 1. Fetch betting history
    const fetchRes = await axios.post(
      `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`
    );

    const records = JSON.parse(fetchRes.data.result || "[]");
    console.log("records", records);
    if (!records.length) {
      console.log("No new betting records.");
      return;
    }

    let storedIds = [];
    let alreadyExists = 0;

    for (const record of records) {
      const existing = await BettingHistory.findOne({ id: record.id });
      if (!existing) {
        await BettingHistory.create({
          id: record.id,
          ref_no: record.ref_no,
          site: record.site,
          product: record.product,
          member: record.member,
          game_id: record.game_id,
          start_time: record.start_time,
          match_time: record.match_time,
          end_time: record.end_time,
          bet_detail: record.bet_detail,
          turnover: record.turnover,
          bet: record.bet,
          payout: record.payout,
          commission: record.commission,
          p_share: record.p_share,
          p_win: record.p_win,
          status: record.status,
        });
        storedIds.push(record.id);
      } else {
        alreadyExists++;
      }
    }

    if (storedIds.length === 0) {
      console.log(`All records already stored. Duplicates: ${alreadyExists}`);
      return;
    }

    // 2. Mark newly stored tickets
    const ticketString = storedIds.join(",");
    console.log("Tickets to mark:", ticketString);
    const markSignature = generateSignature();

    const markRes = await axios.post(
      `${LOG_URL}/markbyjson.ashx`,
      {
        ticket: ticketString,
        operatorcode: OPERATOR_CODE,
        signature: markSignature,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Marked Tickets:", markRes.data);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const PROVIDER_CODES = ['RE', 'ME', 'PR', 'SG'];
    // const signature = generateSignature(OPERATOR_CODE);

    for (const provider of PROVIDER_CODES) {
      const url = `${LOG_URL}/getDailyWager.ashx?operatorcode=${OPERATOR_CODE}&dateF=${dateStr}&dateT=${dateStr}&providercode=${provider}&signature=${signature}`;

      try {
        const response = await axios.get(url);
        const { errCode, result, errMsg } = response.data;
        console.log("response", response.data);
        if (errCode !== '0') {
          console.warn(`⚠️ Provider ${provider} error: ${errMsg}`);
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
                  member: record.member,
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
            console.error(`❌ Error inserting ref_no ${record.ref_no}:`, err.message);
          }
        }

        console.log(`✅ Updated betting history for provider ${provider}`);
      } catch (error) {
        console.error(`❌ Failed to fetch from provider ${provider}:`, error.message);
      }
    }

  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};

// Schedule to run every minute
// cron.schedule('* * * * *', fetchBettingHistory);



cron.schedule('* * * * *', async () => {
  console.log("BettingHistory Cron job started at", new Date());
  await BettingHistoryJob();
});

module.exports = BettingHistoryJob;
// Constants




// Signature generator
// function generateSignature(operatorCode, secretKey) {
//   const hash = crypto.createHash('md5');
//   hash.update(operatorCode + secretKey);
//   return hash.digest('hex').toUpperCase();
// }

// Fetch + Save Logic
// async function fetchAndStoreBettingHistory() {
//   const now = new Date();
//   const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

//   const signature = generateSignature(OPERATOR_CODE);

//   for (const provider of PROVIDER_CODES) {
//     const url = `${LOG_URL}/getDailyWager.ashx?operatorcode=${OPERATOR_CODE}&dateF=${dateStr}&dateT=${dateStr}&providercode=${provider}&signature=${signature}`;

//     try {
//       const response = await axios.get(url);
//       const { errCode, result, errMsg } = response.data;
// console.log("response", response.data);
//       if (errCode !== '0') {
//         console.warn(`⚠️ Provider ${provider} error: ${errMsg}`);
//         continue;
//       }

//       const records = JSON.parse(result);
//       for (const record of records) {
//         try {
//           await BettingHistory.updateOne(
//             { ref_no: record.ref_no },
//             {
//               $set: {
//                 site: record.site,
//                 product: record.product,
//                 member: record.member,
//                 game_id: record.game_id,
//                 start_time: new Date(record.start_time),
//                 match_time: new Date(record.match_time),
//                 end_time: new Date(record.end_time),
//                 bet_detail: record.bet_detail,
//                 turnover: Number(record.turnover),
//                 bet: Number(record.bet),
//                 payout: Number(record.payout),
//                 commission: Number(record.commission),
//                 p_share: Number(record.p_share),
//                 p_win: Number(record.p_win),
//                 status: Number(record.status),
//               },
//             },
//             { upsert: true }
//           );
//         } catch (err) {
//           console.error(`❌ Error inserting ref_no ${record.ref_no}:`, err.message);
//         }
//       }

//       console.log(`✅ Updated betting history for provider ${provider}`);
//     } catch (error) {
//       console.error(`❌ Failed to fetch from provider ${provider}:`, error.message);
//     }
//   }
// }

// // Cron Job: Runs every minute
// cron.schedule('* * * * *', async () => {
//   console.log(`⏱️ Running betting history fetch at ${new Date().toLocaleString()}`);
//   await fetchAndStoreBettingHistory();
// });



