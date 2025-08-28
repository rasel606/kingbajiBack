const cron = require('node-cron');
const User = require('../Models/User');

const UserBonus = require('../Models/UserBonus');
const { createNotification } = require('../Controllers/notificationController');
const Transaction = require('../Models/TransactionModel');
const Bonus = require('../Models/Bonus');

// Run every Sunday at 23:59 (BD Time)
// server time UTC, BD+6
//  console.log('Weekly Loss Bonus cron started');
const weeklyLossBonusCrons = async () => {
  console.log('Weekly Loss Bonus cron started');
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const users = await User.find({});
  const bonus = await Bonus.find({ _id: "685af83bb49bb1e4765b2c71" });

  for (const user of users) {
    const deposits = await Transaction.find({
      userId: user.userId,
      type: 0, // Deposit
      status: 1, // Accepted
      datetime: { $gte: oneWeekAgo }
    });

    const totalDeposit = deposits.reduce((sum, trx) => sum + trx.base_amount, 0);

    if (totalDeposit > 0) {
      const bonusAmount = parseFloat((totalDeposit * 0.01).toFixed(2));

      // Check if user was referred by an affiliate
      if (user.referredBy) {
        const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });

        if (affiliate) {
          // Deduct the bonus amount from affiliate's balance
          const deductionAmount = bonusAmount * (affiliate.settings.platformFee / 100);

          await AffiliateModel.updateOne(
            { _id: affiliate._id },
            {
              $inc: {
                balance: -deductionAmount,
                totalCommission: -deductionAmount,
                availableBalance: -deductionAmount
              }
            }
          );

          // Record in AffiliateEarnings
          await AffiliateEarnings.updateOne(
            { affiliateId: affiliate._id, period: moment().startOf('month').toDate() },
            {
              $inc: {
                totalBonus: bonusAmount,
                totalDeduction: deductionAmount,
                netProfit: -deductionAmount,
                finalCommission: -deductionAmount
              }
            },
            { upsert: true }
          );

          await addBonusToUser({
            user,
            bonusId: bonus._id,
            amount: rebateAmount,
            bonusType: 'weeklyBonus',
            referredBy: user.referredBy,
            message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
          });
        }

      }
      else {
        await addBonusToUser({
          user,
          bonusId: bonus._id,
          amount: rebateAmount,
          totalBets: totalBets,
          totalTurnover: totalTurnover,
          referredBy: null,
          message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
        });
      }

      // Update user balance

    }
  }
  console.log('Weekly Loss Bonus cron finished');
};

// cron.schedule('59 17 * * 0', weeklyLossBonusCrons, { timezone: 'Asia/Dhaka' }).start( new Date() );

cron.schedule('* * * * *', async () => {
  console.log("🏅 Running weeklyLossBonusCrons update...");
  await weeklyLossBonusCrons();
});


module.exports = weeklyLossBonusCrons;