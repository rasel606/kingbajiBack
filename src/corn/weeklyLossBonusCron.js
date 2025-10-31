// const cron = require('node-cron');
// const User = require('../Models/User');

// const UserBonus = require('../Models/UserBonus');
// const { createNotification } = require('../Controllers/notificationController');
// const Transaction = require('../Models/TransactionModel');
// const Bonus = require('../Models/Bonus');

// // Run every Sunday at 23:59 (BD Time)
// // server time UTC, BD+6
// //  console.log('Weekly Loss Bonus cron started');
// const weeklyLossBonusCrons = async () => {
//   console.log('Weekly Loss Bonus cron started');
//   const oneWeekAgo = new Date();
//   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//   const users = await User.find({});
//   const bonus = await Bonus.find({ _id: "685af83bb49bb1e4765b2c71" });

//   for (const user of users) {
//     const deposits = await Transaction.find({
//       userId: user.userId,
//       type: 0, // Deposit
//       status: 1, // Accepted
//       datetime: { $gte: oneWeekAgo }
//     });

//     const totalDeposit = deposits.reduce((sum, trx) => sum + trx.base_amount, 0);

//     if (totalDeposit > 0) {
//       const bonusAmount = parseFloat((totalDeposit * 0.01).toFixed(2));

//       // Check if user was referred by an affiliate
//       if (user.referredBy) {
//         const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });

//         if (affiliate) {
//           // Deduct the bonus amount from affiliate's balance
//           const deductionAmount = bonusAmount * (affiliate.settings.platformFee / 100);

//           await AffiliateModel.updateOne(
//             { _id: affiliate._id },
//             {
//               $inc: {
//                 balance: -deductionAmount,
//                 totalCommission: -deductionAmount,
//                 availableBalance: -deductionAmount
//               }
//             }
//           );

//           // Record in AffiliateEarnings
//           await AffiliateEarnings.updateOne(
//             { affiliateId: affiliate._id, period: moment().startOf('month').toDate() },
//             {
//               $inc: {
//                 totalBonus: bonusAmount,
//                 totalDeduction: deductionAmount,
//                 netProfit: -deductionAmount,
//                 finalCommission: -deductionAmount
//               }
//             },
//             { upsert: true }
//           );

//           await addBonusToUser({
//             user,
//             bonusId: bonus._id,
//             amount: rebateAmount,
//             bonusType: 'weeklyBonus',
//             referredBy: user.referredBy,
//             message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
//           });
//         }

//       }
//       else {
//         await addBonusToUser({
//           user,
//           bonusId: bonus._id,
//           amount: rebateAmount,
//           totalBets: totalBets,
//           totalTurnover: totalTurnover,
//           referredBy: null,
//           message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
//         });
//       }

//       // Update user balance

//     }
//   }
//   console.log('Weekly Loss Bonus cron finished');
// };

// // cron.schedule('59 17 * * 0', weeklyLossBonusCrons, { timezone: 'Asia/Dhaka' }).start( new Date() );

// cron.schedule('* * * * *', async () => {
//   console.log("🏅 Running weeklyLossBonusCrons update...");
//   await weeklyLossBonusCrons();
// });


// module.exports = weeklyLossBonusCrons;


const cron = require('node-cron');
const moment = require('moment');
const User = require('../Models/User');
const Transaction = require('../Models/TransactionModel');
const Bonus = require('../Models/Bonus');
const AffiliateModel = require('../Models/AffiliateModel');
const AffiliateEarnings = require('../Models/AffiliateUserEarnings');
const { addBonusToUser } = require('../Controllers/bonusController');

// Weekly Loss Bonus Cron
const weeklyLossBonusCrons = async () => {
  try {
    console.log('🏆 Weekly Loss Bonus cron started');

    const oneWeekAgo = moment().subtract(7, 'days').toDate();

    // Fetch the bonus document
    const bonus = await Bonus.findOne({bonusType : 'weeklyBonus'});
    if (!bonus) {
      console.log('❌ Bonus not found');
      return;
    }

    // Fetch all users
    const users = await User.find({});

    for (const user of users) {
      // Sum all deposits for the past week
      const deposits = await Transaction.find({
        userId: user.userId,
        type: 0, // Deposit
        status: 1, // Accepted
        datetime: { $gte: oneWeekAgo },
      });

      const totalDeposit = deposits.reduce((sum, trx) => sum + trx.base_amount, 0);

      if (totalDeposit <= 0) continue; // Skip users with no deposits

      const bonusAmount = parseFloat(((totalDeposit * bonus.percentage) / 100).toFixed(2)); // 1% bonus

      // If user has a referrer (affiliate)
      if (user.referredBy) {
        const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });

        if (affiliate) {
          const deductionAmount = bonusAmount * (affiliate.settings.platformFee / 100);

          // Deduct from affiliate
          await AffiliateModel.updateOne(
            { _id: affiliate._id },
            {
              $inc: {
                balance: -deductionAmount,
                totalCommission: -deductionAmount,
                availableBalance: -deductionAmount,
              },
            }
          );

          // Record in AffiliateEarnings (monthly)
          await AffiliateEarnings.updateOne(
            { affiliateId: affiliate._id, period: moment().startOf('month').toDate() },
            {
              $inc: {
                totalBonus: bonusAmount,
                totalDeduction: deductionAmount,
                netProfit: -deductionAmount,
                finalCommission: -deductionAmount,
              },
            },
            { upsert: true }
          );

          // Add bonus to user
          await addBonusToUser({
             user: user.userId,
          bonusId: bonus._id,
          amount: bonusAmount,
          bonusType: 'weeklyBonus',
          referredBy: null,
          totalTurnover:bonusAmount,
          turnoverMultiplier: bonus.wageringRequirement,
          message: `আপনি আজকের রিবেট বোনাস হিসেবে ${bonusAmount}৳ পেয়েছেন!`,
          expiryDate: moment().add(7, 'days').toDate()
          });
        }
      } else {
        // Users without affiliate
        await addBonusToUser({
          user,
          bonusId: bonus._id,
          amount: bonusAmount,
          bonusType: 'weeklyBonus',
          referredBy: null,
          totalTurnover:bonusAmount,
          turnoverMultiplier: bonus.wageringRequirement,
          message: `আপনি আজকের রিবেট বোনাস হিসেবে ${bonusAmount}৳ পেয়েছেন!`,
          expiryDate: moment().add(7, 'days').toDate()
        });
      }

      // Optional: Update user balance directly if needed
      // await User.updateOne({ _id: user._id }, { $inc: { balance: bonusAmount } });
    }

    console.log('✅ Weekly Loss Bonus cron finished');
  } catch (error) {
    console.error('❌ Error in weeklyLossBonusCrons:', error);
  }
};

// Schedule: every Sunday 23:59 BD time
cron.schedule('59 23 * * 0', weeklyLossBonusCrons, { timezone: 'Asia/Dhaka' });

module.exports = weeklyLossBonusCrons;
