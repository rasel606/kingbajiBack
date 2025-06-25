const cron = require('node-cron');
const User = require('../Models/User');

const UserBonus = require('../Models/UserBonus');
const { createNotification } = require('../Controllers/notificationController');
const Transaction = require('../Models/TransactionModel');
const Bonus = require('../Models/Bonus');

// Run every Sunday at 23:59 (BD Time)
// server time UTC, BD+6
 console.log('Weekly Loss Bonus cron started');
const weeklyLossBonusCrons =async ()=>{
     console.log('Weekly Loss Bonus cron started');

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const users = await User.find({}); // Find all users
  const bonus = await Bonus.find({_id: "685af83bb49bb1e4765b2c71"});
  console.log(bonus);
  for (const user of users) {
    const deposits = await Transaction.find({
      userId: user.userId,
      type: 0, // Deposit
      status: 1, // Accepted
      datetime: { $gte: oneWeekAgo  }
    });

    const totalDeposit = deposits.reduce((sum, trx) => sum + trx.base_amount, 0);

    if (totalDeposit > 0) {
      const bonusAmount = parseFloat((totalDeposit * 0.01).toFixed(2)); // 1% bonus

      // Update user balance
      
      await User.updateOne(
              { userId: user.userId },
              {
                $inc: { balance: bonusAmount, totalBonus: rebateAmount },
                $set: { updatetimestamp: new Date() }
              }
            );

      // Create bonus log (optional)
      await UserBonus.create({
        userId: user.userId,
        bonusId: bonus[0]._id,
        amount: bonusAmount,
        remainingAmount: bonusAmount,
        turnoverRequirement: bonusAmount * 10, // e.g., 10x wager
        status: 'completed',
        expiryDate: oneWeekAgo // 7 days
      });

      // Send notification
      await createNotification(
        'Weekly Loss Bonus',
        user.userId,
        `আপনি এই সপ্তাহে 1% (${bonusAmount}৳) বোনাস পেয়েছেন!`,
        'balance_added',
        {
          amount: bonusAmount
        }
      );

      console.log(`Bonus given to user ${user.userId}: ${bonusAmount}৳`);
    }
  }

  console.log('Weekly Loss Bonus cron finished');
}

// cron.schedule('59 17 * * 0', weeklyLossBonusCrons, { timezone: 'Asia/Dhaka' }).start( new Date() );

cron.schedule('* * * * *', weeklyLossBonusCrons);


module.exports = weeklyLossBonusCrons;