// const User = require('../Models/User');
// const BettingHistory = require('../Models/BettingHistory');


// const getCashbackRate = (total, level) => {
//   for (let tier of CASHBACK_TIERS) {
//     if (total >= tier.minTurnover) return tier[`tier${level}`] || 0;
//   }
//   return 0;
// };

// exports.calculateDailyCashback = async () => {

//   console.log("calculateDailyCashback");
//   const today = new Date();
//   today.setHours(22, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   const users = await User.find({ referralCode: { $exists: true } });

//   for (const user of users) {
//     const referrals = [
//       { level: 1, ids: user.levelOneReferrals },
//       { level: 2, ids: user.levelTwoReferrals },
//       { level: 3, ids: user.levelThreeReferrals }
//     ];

//     let totalCashback = 0;

//     for (const { level, ids } of referrals) {
//       if (!ids || ids.length === 0) continue;
// console.log("ids",ids, "level",level);
//       const bets = await BettingHistory.aggregate([
//         { $match: { member: { $in: ids }, start_time: { $gte: today, $lt: tomorrow } } },
//         { $group: { _id: null, totalTurnover: { $sum: "$turnover" } } }
//       ]);
// console.log("bets",bets);
//       const turnover = bets[0]?.totalTurnover || 0;
//       const cashbackRate = getCashbackRate(turnover, level);
//       const cashback = turnover * cashbackRate;

//       totalCashback += cashback;
//     }

//     if (totalCashback > 0.01) {
//       user.cashReward += totalCashback;
//       await user.save();
//       console.log(`✅ Cashback ৳${totalCashback.toFixed(2)} given to ${user.userId}`);
//     }
//   }

//   console.log("✅ Daily Cashback Calculation Done");
// };




// const cron = require('node-cron');
// const User = require('../Models/User');
// const ReferralBonus = require('../Models/ReferralBonus');
// const Bonus = require('../Models/Bonus');

// // Get cashback tiers from Bonus table
// const getCashbackTiers = async () => {
//   const bonuses = await Bonus.find({ bonusType: 'referralRebate' }).sort({ minAmount: -1 });
//   return bonuses.map(b => ({
//     min: b.minAmount,
//     tier1: b.tier1,
//     tier2: b.tier2,
//     tier3: b.tier3
//   }));
// };

// // Cron job: run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//   console.log('🔄 Running optimized daily referral cashback cron...');

//   try {
//     const tiers = await getCashbackTiers();

//     // Only get users with referred users
//     const users = await User.find({ referredUsers: { $exists: true, $ne: [] } });

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Start of today

//     for (const user of users) {
//       // Skip if user already has cashback for today
//       const alreadyProcessed = await ReferralBonus.findOne({
//         userId: user.userId,
//         createdAt: { $gte: today }
//       });

//       if (alreadyProcessed) continue;

//       let totalReferredTurnover = 0;

//       // Sum total bets of referred users
//       for (const referredUserId of user.referredUsers) {
//         const referredUser = await User.findOne({ userId: referredUserId });
//         if (!referredUser) continue;

//         totalReferredTurnover += referredUser.totalBets || 0;
//       }

//       if (totalReferredTurnover <= 0) continue;

//       // Determine tier
//       const applicableTier = tiers.find(t => totalReferredTurnover >= t.min);
//       if (!applicableTier) continue;

//       // Calculate level-wise cashback
//       const cashbackAmounts = [
//         (applicableTier.tier1 || 0) * totalReferredTurnover,
//         (applicableTier.tier2 || 0) * totalReferredTurnover,
//         (applicableTier.tier3 || 0) * totalReferredTurnover
//       ];

//       // Save in ReferralBonus
//       for (let i = 0; i < cashbackAmounts.length; i++) {
//         if (cashbackAmounts[i] > 0) {
//           await ReferralBonus.create({
//             userId: user.userId,
//             referredUser: user.referredUsers[i] || null,
//             level: i + 1,
//             amount: cashbackAmounts[i],
//             claimed: false,
//             createdAt: new Date(),
//             updatedAt: new Date()
//           });
//         }
//       }
//     }

//     console.log('✅ Optimized daily referral cashback cron completed.');
//   } catch (error) {
//     console.error('❌ Error in optimized daily referral cashback cron:', error);
//   }
// });








// const cron = require('node-cron');
// const User = require('../Models/User');
// const ReferralBonus = require('../Models/ReferralBonus');
// const Bonus = require('../Models/Bonus');
// const BettingHistory = require('../Models/BettingHistory');

// // Cron job: run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//   console.log('🔄 Running optimized bulk referral cashback cron...');

//   try {
//     const bonuses = await Bonus.find({ bonusType: 'referralRebate', isActive: true }).sort({ minAmount: -1 });
//     if (!bonuses.length) return console.log('⚠️ No active referral rebates found.');

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Aggregate all turnovers for level 1, 2, 3 referrals at once
//     const pipeline = [
//       { 
//         $match: { start_time: { $gte: today } }
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'member',
//           foreignField: 'userId',
//           as: 'userInfo'
//         }
//       },
//       { $unwind: '$userInfo' },
//       {
//         $project: {
//           member: 1,
//           turnover: 1,
//           userId: '$userInfo.referredBy',
//           level1: '$userInfo.levelOneReferrals',
//           level2: '$userInfo.levelTwoReferrals',
//           level3: '$userInfo.levelThreeReferrals'
//         }
//       }
//     ];

//     const bettingData = await BettingHistory.aggregate(pipeline);

//     // Prepare a map for each user and level
//     const userMap = {};

//     for (const bet of bettingData) {
//       ['level1','level2','level3'].forEach((lvl, idx) => {
//         if (!bet[lvl] || !bet[lvl].length) return;
//         bet[lvl].forEach(refUserId => {
//           if (!userMap[refUserId]) userMap[refUserId] = { level1:0, level2:0, level3:0 };
//           userMap[refUserId][lvl] += bet.turnover;
//         });
//       });
//     }

//     // Iterate over userMap to create ReferralBonus entries
//     for (const [userId, levels] of Object.entries(userMap)) {

//       // Skip if already processed today
//       const alreadyProcessed = await ReferralBonus.findOne({
//         userId,
//         earnedAt: { $gte: today }
//       });
//       if (alreadyProcessed) continue;

//       // Find highest applicable bonus per user
//       const totalTurnover = Math.max(levels.level1, levels.level2, levels.level3);
//       const applicableBonus = bonuses.find(b => totalTurnover >= (b.minAmount || 0));
//       if (!applicableBonus) continue;

//       ['level1','level2','level3'].forEach(async (lvl, idx) => {
//         const turnover = levels[lvl];
//         if (turnover <= 0) return;

//         const percent = applicableBonus[`level${idx+1}Percent`] || applicableBonus[`tier${idx+1}`] || 0;
//         if (percent <= 0) return;

//         const amount = turnover * percent;

//         await ReferralBonus.create({
//           bonusId: applicableBonus._id,
//           userId,
//           level: idx+1,
//           amount,
//           turnover,
//           isClaimed: false,
//           earnedAt: new Date(),
//           status: 'pending'
//         });

//         console.log(`✅ Bonus ₹${amount.toFixed(2)} created for user ${userId}, level ${idx+1}`);
//       });
//     }

//     console.log('✅ Optimized bulk referral cashback cron completed.');

//   } catch (error) {
//     console.error('❌ Error in optimized referral cashback cron:', error);
//   }
// });












const cron = require('node-cron');
const User = require('../Models/User');
const ReferralBonus = require('../Models/ReferralBonus');
const Bonus = require('../Models/Bonus');

// Get active referral rebate bonuses sorted by minAmount descending
const getActiveReferralBonuses = async () => {
  return await Bonus.find({ bonusType: 'referralRebate', isActive: true }).sort({ minAmount: -1 });
};

// Cron job: run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running intelligent daily referral cashback cron...');

  try {
    const bonuses = await getActiveReferralBonuses();
    if (!bonuses.length) return console.log('⚠️ No active referral rebates found.');

    const users = await User.find({ referredUsers: { $exists: true, $ne: [] } });
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    for (const user of users) {
      // Skip if cashback already given today
      const alreadyProcessed = await ReferralBonus.findOne({
        userId: user.userId,
        createdAt: { $gte: today }
      });
      if (alreadyProcessed) continue;

      let totalReferredTurnover = 0;
      for (const referredUserId of user.referredUsers) {
        const referredUser = await User.findOne({ userId: referredUserId });
        if (!referredUser) continue;
        totalReferredTurnover += referredUser.totalBets || 0;
      }

      if (totalReferredTurnover <= 0) continue;

      // Find the highest applicable bonus based on tier minAmount
      const applicableBonus = bonuses.find(b => totalReferredTurnover >= (b.minAmount || 0));
      if (!applicableBonus) continue;

      // Determine level percentages intelligently
      const levelPercentages = [
        user.referredByLevel === 1 ? applicableBonus.level1Percent : 0,
        user.referredByLevel === 2 ? applicableBonus.level2Percent : 0,
        user.referredByLevel === 3 ? applicableBonus.level3Percent : 0
      ];

      // If no user-specific level, fallback to default tier percentages
      for (let i = 0; i < levelPercentages.length; i++) {
        if (levelPercentages[i] === 0) {
          // fallback to tier-based percentage
          const tierKey = `tier${i + 1}`;
          levelPercentages[i] = applicableBonus[tierKey] || 0;
        }
      }

      // Save ReferralBonus per level
      for (let i = 0; i < levelPercentages.length; i++) {
        const amount = totalReferredTurnover * levelPercentages[i];
        if (amount > 0) {
          await ReferralBonus.create({
            bonusId: applicableBonus._id,
            userId: user.userId,
            referredUser: user.referredUsers[i] || null,
            level: i + 1,
            amount,
            isClaimed: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    console.log('✅ Intelligent daily referral cashback cron completed.');
  } catch (error) {
    console.error('❌ Error in intelligent daily referral cashback cron:', error);
  }
});
