const User = require('../Models/User');
const BettingHistory = require('../Models/BettingHistory');
const ReferralBonus = require('../Models/ReferralBonus');
const cron = require('node-cron');
const tiers = [
  { threshold: 500000, tier1: 0.0020, tier2: 0.0007, tier3: 0.0003 },
  { threshold: 200000, tier1: 0.0015, tier2: 0.0006, tier3: 0.0002 },
  { threshold: 100, tier1: 0.0010, tier2: 0.0005, tier3: 0.0001 }
];

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

const getTurnoverSum = async (userIds, start, end) => {
  if (!userIds || userIds.length === 0) return 0;
  const result = await BettingHistory.aggregate([
    {
      $match: {
        member: { $in: userIds },
        start_time: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalTurnover: { $sum: "$turnover" }
      }
    }
  ]);
  return result.length > 0 ? result[0].totalTurnover : 0;
}


console.log("✅ Daily referral cashback calculation completed.");
      console.log("Cron job started at", new Date()),
      console.log("Cron job ended at", new Date());

const rewardProcessor = async () => {
  try {
    const now = new Date();

    // Set time: 22:00 (BD GMT+6) previous day to 21:59 today
    const start = new Date(now);
    start.setHours(0, 0, 0, 0); // 00:00 today (BDT)
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setMilliseconds(-1); // 23:59:59.999

    const users = await User.find();

    for (const user of users) {
      const level1Ids = user.levelOneReferrals || [];
      const level2Ids = user.levelTwoReferrals || [];
      const level3Ids = user.levelThreeReferrals || [];

      const level1Turnover = await getTurnoverSum(level1Ids, start, end);
      const level2Turnover = await getTurnoverSum(level2Ids, start, end);
      const level3Turnover = await getTurnoverSum(level3Ids, start, end);

      const level1Percent = getRewardPercent(level1Turnover, 1);
      const level2Percent = getRewardPercent(level2Turnover, 2);
      const level3Percent = getRewardPercent(level3Turnover, 3);

      const level1Reward = level1Turnover * level1Percent;
      const level2Reward = level2Turnover * level2Percent;
      const level3Reward = level3Turnover * level3Percent;
      console.log(level1Reward, "level1Reward", level2Reward, "level1Reward", level3Reward)
      const totalReward = level1Reward + level2Reward + level3Reward;
      console.log("totalReward", totalReward)
      if (totalReward >= 0.01) {
        await ReferralBonus.create([
          {
            userId: user.userId,
            referredUser: null,
            level: 1,
            amount: level1Reward,
            turnover: level1Turnover,
            referredbyAgent: user.referredbyAgent || null,
            referredbyAffiliate: user.referredbyAffiliate || null,
            referredbysubAdmin: user.referredbysubAdmin || null,
          },
          {
            userId: user.userId,
            referredUser: null,
            level: 2,
            amount: level2Reward,
            turnover: level2Turnover,
            referredbyAgent: user.referredbyAgent || null,
            referredbyAffiliate: user.referredbyAffiliate || null,
            referredbysubAdmin: user.referredbysubAdmin || null,
          },
          {
            userId: user.userId,
            referredUser: null,
            level: 3,
            amount: level3Reward,
            turnover: level3Turnover,
            referredbyAgent: user.referredbyAgent || null,
            referredbyAffiliate: user.referredbyAffiliate || null,
            referredbysubAdmin: user.referredbysubAdmin || null,
          }
        ]);

        // Update User’s cashReward
        await User.updateOne({ userId: user.userId }, {
          $inc: { cashReward: totalReward }
        });
      }

    }
      
  } catch (error) {
      console.error("❌ Error in daily cashback job:", error);
    }
  }




cron.schedule('10 1 * * *',rewardProcessor);

module.exports = rewardProcessor;


// const User = require('../models/User');
// const BettingHistory = require('../models/BettingHistory');
// const ReferralBonus = require('../models/ReferralBonus');

// const BONUS_AMOUNT = 300;
// const REQUIRED_TURNOVER = 8500;
// const REQUIRED_REFERRER_TURNOVER = 4250;
// const REQUIRED_REFERRER_DEPOSIT = 1000;
// const MAX_VALID_DAYS = 7;

// const calculateReferralBonus = async () => {
//   try {
//     const users = await User.find({ referredBy: { $ne: null }, createdAt: { $exists: true } });

//     for (const referee of users) {
//       const referrer = await User.findOne({ referralCode: referee.referredBy });
//       if (!referrer) continue;

//       const registrationDate = new Date(referee.createdAt);
//       const today = new Date();
//       const diffDays = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
//       if (diffDays > MAX_VALID_DAYS) continue;

//       const referrerBets = await BettingHistory.aggregate([
//         { $match: { member: referrer.userId } },
//         { $group: { _id: null, totalTurnover: { $sum: "$turnover" }, totalBet: { $sum: "$bet" } } }
//       ]);
//       const refereeBets = await BettingHistory.aggregate([
//         { $match: { member: referee.userId } },
//         { $group: { _id: null, totalTurnover: { $sum: "$turnover" } } }
//       ]);

//       const referrerTurnover = referrerBets[0]?.totalTurnover || 0;
//       const referrerDeposit = referrerBets[0]?.totalBet || 0;
//       const refereeTurnover = refereeBets[0]?.totalTurnover || 0;

//       const alreadyGiven = await ReferralBonus.findOne({
//         userId: referrer.userId,
//         referredUser: referee.userId,
//         level: 1
//       });

//       if (
//         referrerTurnover >= REQUIRED_REFERRER_TURNOVER &&
//         referrerDeposit >= REQUIRED_REFERRER_DEPOSIT &&
//         refereeTurnover >= REQUIRED_TURNOVER &&
//         !alreadyGiven
//       ) {
//         await ReferralBonus.create({
//           userId: referrer.userId,
//           referredUser: referee.userId,
//           level: 1,
//           amount: BONUS_AMOUNT,
//           turnover: 0,
//           referredbyAgent: referrer.referredbyAgent,
//           referredbyAffiliate: referrer.referredbyAffiliate,
//           referredbysubAdmin: referrer.referredbysubAdmin
//         });

//         referrer.totalBonus += BONUS_AMOUNT;
//         await referrer.save();
//         console.log(`✅ Bonus added for ${referrer.userId} for referring ${referee.userId}`);
//       }
//     }

//     console.log("🎉 Referral Bonus check completed.");
//   } catch (err) {
//     console.error("❌ Referral Bonus Error:", err);
//   }
// };

// module.exports = calculateReferralBonus;
