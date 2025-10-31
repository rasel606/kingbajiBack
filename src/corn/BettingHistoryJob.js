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

const BettingHistoryJob = async () => {
  const signature = generateSignature(OPERATOR_CODE);
console.log('API call:', `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}` );
  try {
    // 1. Fetch betting history
    const fetchRes = await axios.get(
      `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`
    );

    // Check if response has error
    if (fetchRes.data.errCode !== '0') {
      console.error('API Error:', fetchRes.data.errMsg);
      return;
    }

    // Parse the result string to JSON
    let records = [];
    // console.log(fetchRes.data.result);
    try {
      records = JSON.parse(fetchRes.data.result || "[]");

      console.log("Fetched records count:", records.length);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError.message);
      return;
    }

    console.log("Fetched records count:", records.length);

    if (!records.length) {
      console.log("No new betting records.");
      return;
    }

    let storedIds = [];
    let alreadyExists = 0;

    for (const record of records) {
      try {
        // Check if record already exists
        const existing = await BettingHistory.findOne({ id: record.id });
        storedIds.push( record.id.toString() );
        if (!existing) {
          // Create new record
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
          storedIds.push(record.id.toString()); // Ensure it's a string
        } else {
          // storedIds.push(record.id.toString());
          // console.log("Existing record:", record.id);
          alreadyExists++;
        }
      } catch (dbError) {
        console.error('Database error for record', record.id, ':', dbError.message);
      }
    }
    console.log("Fetched storedIds:", storedIds);
    console.log(`New records stored: ${storedIds.length}, Duplicates: ${alreadyExists}`);
    console.log("Fetched storedIds count:", storedIds);
    if (storedIds.length === 0) {
      console.log("No new records to mark.");
      return;
    }

    // 2. Mark newly stored tickets
    const ticketString = storedIds.join(",");
    console.log("Tickets to mark:", ticketString);
    const markSignature = generateSignature(OPERATOR_CODE);

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

    console.log("Mark response:", markRes.data);

  } catch (err) {
    console.error('Fetch error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
};

// Schedule to run every minute
cron.schedule('* * * * *', async () => {
  console.log("🏅 Running BettingHistoryJob update...");
  await BettingHistoryJob();
});

module.exports = BettingHistoryJob;