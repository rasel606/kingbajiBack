const { default: axios } = require("axios");
const BettingHistory = require("../Models/BettingHistory");
const cron = require('node-cron');

async function bettingHistoryService() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const signature = generateSignature(OPERATOR_CODE);

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
}

// Cron Job: Runs every minute
cron.schedule('* * * * *', async () => {
    console.log("🏅 Running bettingHistoryService update...");
    await bettingHistoryService();
});


module.exports =  bettingHistoryService