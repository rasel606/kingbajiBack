// const cron = require("node-cron");
// const axios = require("axios");
// const md5 = require("md5");
// const BettingHistory = require("../models/BettingHistory");
// const BonusWallet = require("../models/BonusWallet");
// const UserVip = require("../models/UserVip");

// const LOG_URL = "http://fetch.336699bet.com";
// const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
// const OPERATOR_CODE = "rbdb";

// const generateSignature = (operatorCode) => {
//   return md5(operatorCode + SECRET_KEY).toUpperCase();
// };

// const BettingHistoryJob = async () => {
//   const signature = generateSignature(OPERATOR_CODE);
//   console.log(
//     "API call:",
//     `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`
//   );
//   try {
//     // 1. Fetch betting history
//     const fetchRes = await axios.get(
//       `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`
//     );

//     // Check if response has error
//     if (fetchRes.data.errCode !== "0") {
//       console.error("API Error:", fetchRes.data.errMsg);
//       return;
//     }

//     // Parse the result string to JSON
//     let records = [];
//     // console.log(fetchRes.data.result);
//     try {
//       records = JSON.parse(fetchRes.data.result || "[]");

//       console.log("Fetched records count:", records.length);
//     } catch (parseError) {
//       console.error("Error parsing JSON response:", parseError.message);
//       return;
//     }

//     console.log("Fetched records count:", records.length);

//     if (!records.length) {
//       console.log("No new betting records.");
//       return;
//     }

//     let storedIds = [];
//     let alreadyExists = 0;

//     for (const record of records) {
//       try {
//         // Check if record already exists
//         const existing = await BettingHistory.findOne({ id: record.id });
//         storedIds.push(record.id.toString());
//         if (!existing) {
//           // Create new record
//           await BettingHistory.create({
//             id: record.id,
//             ref_no: record.ref_no,
//             site: record.site,
//             product: record.product,
//             member: record.member,
//             game_id: record.game_id,
//             start_time: record.start_time,
//             match_time: record.match_time,
//             end_time: record.end_time,
//             bet_detail: record.bet_detail,
//             turnover: record.turnover,
//             bet: record.bet,
//             payout: record.payout,
//             commission: record.commission,
//             p_share: record.p_share,
//             p_win: record.p_win,
//             status: record.status,
//           });

//           // Update VIP System
//           const userId = record.member;
//           const betAmount = parseFloat(record.bet) || 0;
//           const turnoverAmount = parseFloat(record.turnover) || 0;

//           // Process Bonus Wallet
//           // BONUS WALLET PROCESSING
//           let bonusWallet = await BonusWallet.findOne({
//             userId: userId,
//             status: "ACTIVE",
//           });

//           // যদি বোনাস না থাকে → নতুন বোনাস ওয়ালেট তৈরি করা হবে
//           if (!bonusWallet) {
//             bonusWallet = await BonusWallet.create({
//               userId: userId,
//               bonusId: `AUTO_${Date.now()}`,
//               bonusType: "dailyRebate", // default, আপনি ইচ্ছামত দিতে পারবেন
//               amount: betAmount * bonusWallet.wageringRequirementPercent / 100,
//               balance: bonusWallet.wageringRequirementPercent / 100,
//               wageringRequirement: 0,
//               wageringCompleted: 0,
//               provider: record.site,
//               status: "ACTIVE",

//               activatedAt: new Date(),
//             });

//             console.log(`New BonusWallet created for user ${userId}`);
//           }
//           // বেটের পরিমাণ ওয়ালেট থেকে কেটে নেওয়া হবে
//           bonusWallet.balance += betAmount * bonusWallet.wageringRequirementPercent / 100;
//           bonusWallet.amount += betAmount * bonusWallet.wageringRequirementPercent / 100;
//           bonusWallet.provider = record.site;
//           await bonusWallet.save();
//           // if (bonusWallet.wageringRequirement > 0) {
//           //   bonusWallet.wageringCompleted += betAmount;

//           //   bonusWallet.wageringCompletedPercent = Math.min(
//           //     100,
//           //     (bonusWallet.wageringCompleted /
//           //       bonusWallet.wageringRequirement) *
//           //       100
//           //   );

//           //   // Requirement পূরণ হলে unlock
//           //   if (
//           //     bonusWallet.wageringCompleted >= bonusWallet.wageringRequirement
//           //   ) {
//           //     bonusWallet.locked = false;
//           //   }

//           //   await bonusWallet.save();

//           //   console.log(`Updated BonusWallet for ${userId}:`, {
//           //     wageringCompleted: bonusWallet.wageringCompleted,
//           //     percent: bonusWallet.wageringCompletedPercent,
//           //   });
//           // }

//           // Process VIP System
//           let userVip = await UserVip.findOne({ userId: record.member });

//           if (userVip) {
//             // Add turnover to VIP record
//             await userVip.updateOne({
//               $inc: {
//                 monthlyTurnover: turnoverAmount,
//                 lifetimeTurnover: turnoverAmount,
//                 vipPoints: Math.floor(betAmount),
//               },
//             });

//             console.log(`VIP updated for user ${userId}:`, {
//               currentLevel: userVip.currentLevel,
//               vipPoints: userVip.vipPoints,
//               lifetimeTurnover: userVip.lifetimeTurnover,
//             });
//           } else {
//             // Create new VIP record if user doesn't have one
//             userVip = new UserVip({
//               userId: userId,
//               currentLevel: "Bronze",
//               vipPoints: Math.floor(betAmount),
//               monthlyTurnover: turnoverAmount,
//               lifetimeTurnover: turnoverAmount,
//             });

//             await userVip.save();
//             console.log(`New VIP created for user ${userId} at Bronze level`);
//           }

//           storedIds.push(record.id.toString()); // Ensure it's a string
//         } else {
//           // storedIds.push(record.id.toString());
//           // console.log("Existing record:", record.id);
//           alreadyExists++;
//         }
//       } catch (dbError) {
//         console.error(
//           "Database error for record",
//           record.id,
//           ":",
//           dbError.message
//         );
//       }
//     }
//     console.log("Fetched storedIds:", storedIds);
//     console.log(
//       `New records stored: ${storedIds.length}, Duplicates: ${alreadyExists}`
//     );
//     console.log("Fetched storedIds count:", storedIds);
//     if (storedIds.length === 0) {
//       console.log("No new records to mark.");
//       return;
//     }

//     // 2. Mark newly stored tickets
//     const ticketString = storedIds.join(",");
//     console.log("Tickets to mark:", ticketString);
//     const markSignature = generateSignature(OPERATOR_CODE);

//     const markRes = await axios.post(
//       `${LOG_URL}/markbyjson.ashx`,
//       {
//         ticket: ticketString,
//         operatorcode: OPERATOR_CODE,
//         signature: markSignature,
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("Mark response:", markRes.data);
//   } catch (err) {
//     console.error("Fetch error:", err.message);
//     if (err.response) {
//       console.error("Response data:", err.response.data);
//     }
//   }
// };

// // Schedule to run every minute
// cron.schedule("* * * * *", async () => {
//   console.log("🏅 Running BettingHistoryJob update...");
//   await BettingHistoryJob();
// });

// module.exports = BettingHistoryJob;






const cron = require("node-cron");
const axios = require("axios");
const md5 = require("md5");

const BettingHistory = require("../models/BettingHistory");
const BonusWallet = require("../models/BonusWallet");
const Bonus = require("../models/Bonus");
const UserVip = require("../models/UserVip");

/* ==============================
   CONFIG
================================ */
const LOG_URL = "http://fetch.336699bet.com";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
const OPERATOR_CODE = "rbdb";

// Daily rebate percent
const DAILY_REBATE_PERCENT = 1; // 1%

/* ==============================
   HELPERS
================================ */
const generateSignature = () =>
  md5(OPERATOR_CODE + SECRET_KEY).toUpperCase();

/* ==============================
   MAIN JOB
================================ */
const BettingHistoryJob = async () => {
  const signature = generateSignature();

  console.log("📡 Fetching betting history...");

  try {
    /* ==============================
       1. FETCH BETTING HISTORY
    ================================ */
    const fetchRes = await axios.get(
      `${LOG_URL}/fetchbykey.aspx?operatorcode=${OPERATOR_CODE}&versionkey=0&signature=${signature}`
    );

    if (fetchRes.data.errCode !== "0") {
      console.error("❌ API Error:", fetchRes.data.errMsg);
      return;
    }

    let records = [];
    try {
      records = JSON.parse(fetchRes.data.result || "[]");
    } catch (err) {
      console.error("❌ JSON Parse Error:", err.message);
      return;
    }

    if (!records.length) {
      console.log("ℹ️ No new betting records");
      return;
    }

    console.log(`✅ Records fetched: ${records.length}`);

    const storedIds = [];
    let duplicateCount = 0;

    /* ==============================
       2. PROCESS RECORDS
    ================================ */
    for (const record of records) {
      try {
        const exists = await BettingHistory.findOne({ id: record.id });
        if (exists) {
          duplicateCount++;
          continue;
        }

        /* ==============================
           SAVE BETTING HISTORY
        ================================ */
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

        storedIds.push(record.id.toString());

        const userId = record.member;
        const betAmount = Number(record.bet) || 0;
        const turnoverAmount = Number(record.turnover) || 0;

        /* ==============================
           BONUS WALLET (DAILY REBATE)
        ================================ */
        const rebateAmount =
          (betAmount * DAILY_REBATE_PERCENT) / 100;

        let bonusWallet = await BonusWallet.findOne({
          userId,
          bonusType: "dailyRebate",
        });
        let bonus = await Bonus.findOne({
          bonusType: "dailyRebate",
        });

        if (!bonusWallet) {
          bonusWallet = await BonusWallet.create({
            userId,
            bonusId: bonus._id,
            bonusType: bonus.bonusType,
            amount: rebateAmount,
            balance: rebateAmount,
            wageringRequirement: bonus.wageringRequirement,
            wageringCompleted: 0,
            provider: record.site,
            status: "ACTIVE",
            activatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
        } else {
          bonusWallet.wageringCompleted += rebateAmount;
          
          bonusWallet.amount += rebateAmount;
          bonusWallet.balance += rebateAmount;
          bonusWallet.provider = record.site;
          
          await bonusWallet.save();
        }

        /* ==============================
           VIP SYSTEM
        ================================ */
        await UserVip.findOneAndUpdate(
          { userId },
          {
            $inc: {
              monthlyTurnover: turnoverAmount,
              lifetimeTurnover: turnoverAmount,
              vipPoints: Math.floor(betAmount),
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      } catch (err) {
        console.error(
          `❌ Error processing record ${record.id}:`,
          err.message
        );
      }
    }

    console.log(
      `📊 New: ${storedIds.length}, Duplicate: ${duplicateCount}`
    );

    if (!storedIds.length) return;

    /* ==============================
       3. MARK TICKETS AS FETCHED
    ================================ */
    const markRes = await axios.post(
      `${LOG_URL}/markbyjson.ashx`,
      {
        ticket: storedIds.join(","),
        operatorcode: OPERATOR_CODE,
        signature: generateSignature(),
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Tickets marked:", markRes.data);
  } catch (err) {
    console.error("❌ Job failed:", err.message);
  }
};

/* ==============================
   SAFE CRON (NO OVERLAP)
================================ */
let isRunning = false;

cron.schedule("* * * * *", async () => {
  if (isRunning) return;

  isRunning = true;
  console.log("⏱️ BettingHistoryJob started");

  try {
    await BettingHistoryJob();
  } finally {
    isRunning = false;
  }
});

module.exports = BettingHistoryJob;
