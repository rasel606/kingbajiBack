// const cron = require('node-cron');
// const ReferralBonus = require('../models/ReferralBonus');
// const ReferralStats = require('../models/ReferralStats');
// const User = require('../models/User');

// // Process pending referral bonuses daily
// cron.schedule('* * * * *', async () => {
//   try {
//     console.log('🔄 Processing referral bonuses...');
    
//     // Find pending bonuses where conditions might be met
//     const pendingBonuses = await ReferralBonus.find({
//       status: 'pending'
//     }).populate('referredUser');
    
//     for (const bonus of pendingBonuses) {
//       try {
//         const referredUser = bonus.referredUser;
        
//         if (!referredUser) continue;
        
//         // Check conditions (simplified - you would add real checks)
//         const conditionsMet = {
//           totalDeposit: referredUser.balance >= 2000,
//           totalTurnover: false, // You would check betting turnover
//           withinDays: true, // Check registration date
//           emailVerified: referredUser.isVerified?.email || false,
//           phoneVerified: referredUser.isVerified?.phone || false
//         };
        
//         // If all conditions met, mark as available
//         if (Object.values(conditionsMet).every(condition => condition === true)) {
//           bonus.status = 'available';
//           bonus.conditionsMet = conditionsMet;
//           bonus.metAt = new Date();
//           await bonus.save();
          
//           // Update referral stats
//           await ReferralStats.findOneAndUpdate(
//             { userId: bonus.userId },
//             {
//               $inc: {
//                 totalCompleted: 1,
//                 totalEarned: bonus.bonusAmount
//               }
//             },
//             { upsert: true }
//           );
//         }
//       } catch (error) {
//         console.error(`Error processing bonus ${bonus._id}:`, error);
//       }
//     }
    
//     console.log('✅ Referral bonuses processed');
//   } catch (error) {
//     console.error('❌ Referral bonus processor error:', error);
//   }
// });

// // Update daily rebates
// cron.schedule('0 1 * * *', async () => {
//   try {
//     console.log('🔄 Updating daily rebates...');
    
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     yesterday.setHours(0, 0, 0, 0);
    
//     // Calculate rebates from betting history (simplified)
//     // In real implementation, you would calculate based on actual betting history
    
//     console.log('✅ Daily rebates updated');
//   } catch (error) {
//     console.error('❌ Daily rebate update error:', error);
//   }
// });

const cron = require('node-cron');
const ReferralBonus = require('../models/ReferralBonus');
const User = require('../models/User');
const BettingHistory = require('../models/BettingHistory');
const Transaction = require('../models/TransactionModel');
const ReferralStats = require('../models/ReferralStats');

// Runs daily at 1 AM
cron.schedule('0 1 * * *', async () => {
  try {
    const pendingBonuses = await ReferralBonus.find({ status: 'pending' });

    for (const bonus of pendingBonuses) {
      const user = await User.findOne({ userId: bonus.referredUser });
      if (!user) continue;

      const deposit = await Transaction.aggregate([
        { $match: { userId: user.userId, type: 'deposit', status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const turnover = await BettingHistory.aggregate([
        { $match: { member: user.userId } },
        { $group: { _id: null, total: { $sum: '$turnover' } } }
      ]);

      const conditions = {
        deposit: (deposit[0]?.total || 0) >= 2000,
        turnover: (turnover[0]?.total || 0) >= bonus.wageringRequirement,
        emailVerified: user.isVerified.email,
        phoneVerified: user.isVerified.phone,
        withinDays: (Date.now() - user.createdAt) <= 7 * 24 * 60 * 60 * 1000
      };

      if (Object.values(conditions).every(Boolean)) {
        bonus.status = 'available';
        bonus.conditionsMet = conditions;
        bonus.metAt = new Date();
        await bonus.save();

        // Update stats
        await ReferralStats.findOneAndUpdate(
          { userId: bonus.userId },
          { $inc: { totalCompleted: 1, totalEarned: bonus.bonusAmount } },
          { upsert: true }
        );
      }
    }

    console.log('✅ Referral bonuses processed');
  } catch (err) {
    console.error('❌ Error processing referral bonuses:', err);
  }
});
