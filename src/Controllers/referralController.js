// const cron = require('node-cron');
// const User = require('../Models/User');
// const BettingHistory = require('../Models/BettingHistory');

// const CASHBACK_TIERS = [
//   { min: 500000, tier1: 0.20, tier2: 0.07, tier3: 0.03 },
//   { min: 200000, tier1: 0.15, tier2: 0.06, tier3: 0.02 },
//   { min: 100,    tier1: 0.10, tier2: 0.05, tier3: 0.01 }
// ];

// function getCashbackRate(tier, turnover) {
//   for (const t of CASHBACK_TIERS) {
//     if (turnover >= t.min) return t[`tier${tier}`];
//   }
//   return 0;
// }

// async function getReferrals(user) {
//   const level1 = await User.find({ referredBy: user.referralCode }).lean();
//   const level2 = await User.find({ referredBy: { $in: level1.map(u => u.referralCode) } }).lean();
//   const level3 = await User.find({ referredBy: { $in: level2.map(u => u.referralCode) } }).lean();
//     console.log("level1",level1,"level",level2,"level3",level3)
//   return { level1, level2, level3 };
// }

// async function getTurnover(userIds, from, to) {
//   return await BettingHistory.aggregate([
//     {
//       $match: {
//         member: { $in: userIds },
//         start_time: { $gte: from, $lt: to },
//         product: { $nin: ['excluded_market'] }, // Replace if needed
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$turnover" }
//       }
//     }
//   ]);
// }

// const runDailyCashback = async () => {
//   try {
//     const from = new Date();
//     from.setDate(from.getDate() - 1);
//     from.setHours(22, 0, 0, 0);

//     const to = new Date(from);
//     to.setDate(to.getDate() + 1);
//     to.setHours(21, 59, 59, 999);

//     const users = await User.find({}).lean();

//     for (const user of users) {
//       const { level1, level2, level3 } = await getReferrals(user);

//       const level1Turnover = await getTurnover(level1.map(u => u.userId), from, to);
//       const level2Turnover = await getTurnover(level2.map(u => u.userId), from, to);
//       const level3Turnover = await getTurnover(level3.map(u => u.userId), from, to);

//       const t1 = level1Turnover[0]?.total || 0;
//       const t2 = level2Turnover[0]?.total || 0;
//       const t3 = level3Turnover[0]?.total || 0;

//       const c1 = getCashbackRate(1, t1);
//       const c2 = getCashbackRate(2, t2);
//       const c3 = getCashbackRate(3, t3);

//       const cashback = t1 * c1 + t2 * c2 + t3 * c3;
// console.log(cashback)
//       if (cashback > 0) {
//         await User.updateOne({ userId: user.userId }, { $inc: { cashReward: cashback } });
//         console.log(`Cashback of ${cashback.toFixed(2)} added to ${user.userId}`);
//       }
//     }

//     console.log("✅ Daily cashback processed at", new Date().toLocaleString());
//   } catch (err) {
//     console.error("❌ Cashback Cron Job Error:", err);
//   }
// };

// // Schedule it for 03:00 AM (GMT+6) daily => 21:00 GMT
// cron.schedule('* * * * *', runDailyCashback); // 03:00 BD Time (GMT+6)

// module.exports = runDailyCashback;
