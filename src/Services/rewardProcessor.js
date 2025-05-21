
const BettingHistory = require('../Models/BettingHistory');

const User = require('../Models/User');

// রিওয়ার্ড টিয়ার ও পারসেন্টেজ
const tiers = [
  { threshold: 500000, tier1: 0.0020, tier2: 0.0007, tier3: 0.0003 },
  { threshold: 200000, tier1: 0.0015, tier2: 0.0006, tier3: 0.0002 },
  { threshold: 100,    tier1: 0.0010, tier2: 0.0005, tier3: 0.0001 }
];

async function getTurnoverSum(referralUserIds, start, end) {
  if (!referralUserIds || referralUserIds.length === 0) return 0;

  const result = await BettingHistory.aggregate([
    {
      $match: {
        userId: { $in: referralUserIds },
        placedAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalTurnover: { $sum: "$amount" }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalTurnover : 0;
}

function getRewardPercent(turnover, level) {
  for (const tier of tiers) {
    if (turnover >= tier.threshold) {
      if (level === 1) return tier.tier1;
      if (level === 2) return tier.tier2;
      if (level === 3) return tier.tier3;
    }
  }
  return 0;
}

async function processDailyRewards() {
  try {
    const now = new Date();

    // Assume server timezone UTC+6 (Bangladesh)
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 0, 0)); 
    // 18:00 UTC = 00:00 BD time, adjust accordingly

    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const users = await User.find();

    for (const user of users) {
      const level1Turnover = await getTurnoverSum(user.levelOneReferrals, todayStart, todayEnd);
      const level2Turnover = await getTurnoverSum(user.levelTwoReferrals, todayStart, todayEnd);
      const level3Turnover = await getTurnoverSum(user.levelThreeReferrals, todayStart, todayEnd);

      const tier1Percent = getRewardPercent(level1Turnover, 1);
      const tier2Percent = getRewardPercent(level2Turnover, 2);
      const tier3Percent = getRewardPercent(level3Turnover, 3);

      const tier1Reward = level1Turnover * tier1Percent;
      const tier2Reward = level2Turnover * tier2Percent;
      const tier3Reward = level3Turnover * tier3Percent;

      const todayDate = new Date(todayStart.toISOString().slice(0, 10));

      await Turnover.create([
        {
          userId: user.userId,
          tier: 1,
          date: todayDate,
          turnoverAmount: level1Turnover,
          rewardPercent: tier1Percent,
          rewardAmount: tier1Reward
        },
        {
          userId: user.userId,
          tier: 2,
          date: todayDate,
          turnoverAmount: level2Turnover,
          rewardPercent: tier2Percent,
          rewardAmount: tier2Reward
        },
        {
          userId: user.userId,
          tier: 3,
          date: todayDate,
          turnoverAmount: level3Turnover,
          rewardPercent: tier3Percent,
          rewardAmount: tier3Reward
        }
      ]);
    }
    console.log("Daily reward processing completed.");
  } catch (err) {
    console.error("Error processing daily rewards:", err);
  }
}

module.exports = { processDailyRewards };









// const Turnover = require('../models/Turnover');
// const User = require('../models/User');

// const TIER_PERCENTAGES = {
//   tier1: 0.05,
//   tier2: 0.03,
//   tier3: 0.02,
// };

// exports.calculateDailyRewards = async () => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const todayTurnovers = await Turnover.find({
//       date: { $gte: today, $lt: tomorrow }
//     }).populate('user');

//     for (const turnover of todayTurnovers) {
//       const user = turnover.user;

//       if (user.referredBy) {
//         const tier1 = await User.findOne({ referralCode: user.referredBy });
//         if (tier1) {
//           tier1.cashReward += turnover.amount * TIER_PERCENTAGES.tier1;
//           await tier1.save();
//         }

//         if (tier1?.referredBy) {
//           const tier2 = await User.findOne({ referralCode: tier1.referredBy });
//           if (tier2) {
//             tier2.cashReward += turnover.amount * TIER_PERCENTAGES.tier2;
//             await tier2.save();
//           }

//           if (tier2?.referredBy) {
//             const tier3 = await User.findOne({ referralCode: tier2.referredBy });
//             if (tier3) {
//               tier3.cashReward += turnover.amount * TIER_PERCENTAGES.tier3;
//               await tier3.save();
//             }
//           }
//         }
//       }
//     }

//     console.log('✅ Daily rewards calculation complete.');
//   } catch (err) {
//     console.error('❌ Error:', err);
//   }
// };
