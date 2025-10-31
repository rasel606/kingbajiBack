const User = require('../Models/User');
const UserBonus = require('../Models/UserBonus');
const ReferralBonus = require('../Models/ReferralBonus');
const { createNotification } = require('./notificationController');

// Claim daily referral cashback
const claimDailyReferralCashback = async (userId) => {
  try {
    // Get all unclaimed referral bonus for this user
    const unclaimedBonuses = await ReferralBonus.find({ userId, isClaimed: false });
    const Newbonuses = await Bonus.find({ bonusType: 'referralRebate' }).sort({ minAmount: -1 });
    if (!unclaimedBonuses.length) return { success: false, message: 'No unclaimed cashback.' };

    let totalAmount = 0;

    // Sum all amounts and mark them claimed
    for (const bonus of unclaimedBonuses) {
      totalAmount += bonus.amount;
      bonus.isClaimed = true;
      bonus.updatedAt = new Date();

      await bonus.save();


      await addBonusToUser({
        user: bonus.userId,
        bonusId: Newbonuses._id,
        amount: totalAmount,
        bonusType: 'referralRebate',
        totalTurnover: totalAmount,
        turnoverMultiplier: bonus.wageringRequirement,
        completedTurnover: 0,
        status: 'active',
        expiryDate:Newbonuses.validDays,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Add to UserBonus
    // await UserBonus.create({
    //   userId,
    //   bonusType: 'referralRebate',
    //   amount: totalAmount,
    //   remainingAmount: 0,
    //   turnoverRequirement: Newbonuses.wageringRequirement,
    //   completedTurnover: 0,
    //   status: 'completed',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // });

    // // Update user balance
    // await User.updateOne({ userId }, { $inc: { balance: totalAmount, totalBonus: totalAmount }, $set: { updatetimestamp: new Date() } });

    // // Send notification
    // await createNotification(
    //   'রেফারেল ক্যাশব্যাক',
    //   userId,
    //   `আপনি ${totalAmount}৳ রেফারেল ক্যাশব্যাক ক্লেইম করেছেন!`,
    //   'balance_added',
    //   { amount: totalAmount }
    // );





    return { success: true, message: `Successfully claimed ${totalAmount}৳ cashback.` };
  } catch (error) {
    console.error(`❌ claimDailyReferralCashback error for ${userId}:`, error);
    return { success: false, message: 'Error claiming cashback.' };
  }
};

module.exports = { claimDailyReferralCashback };
