const User = require('../Models/User');
const ReferralBonus = require('../Models/ReferralBonus');
const Turnover = require('../Models/TurnOverModal');

// // Percentage bonuses for each level
// const REFERRAL_BONUS_PERCENTAGES = {
//   1: 0.05, // 5% for level 1
//   2: 0.03, // 3% for level 2
//   3: 0.02  // 2% for level 3
// };

// // Calculate daily referral bonuses based on turnover
// exports.calculateDailyReferralBonuses = async () => {
//   try {
//     // Get yesterday's turnover (from midnight to midnight)
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     yesterday.setHours(0, 0, 0, 0);
    
//     const today = new Date(yesterday);
//     today.setDate(today.getDate() + 1);
    
//     // Get all turnovers from yesterday
//     const turnovers = await Turnover.find({
//       date: { $gte: yesterday, $lt: today }
//     }).populate('user');
    
//     // Process each turnover
//     for (const turnover of turnovers) {
//       const userId = turnover.userId;
      
//       // If user was referred by someone, process bonuses
//       if (userId.referredBy) {
//         await processReferralBonus(userId, turnover.amount);
//       }
//     }
    
//     console.log(`✅ Successfully processed referral bonuses for ${turnovers.length} turnovers`);
//   } catch (error) {
//     console.error('❌ Error calculating daily referral bonuses:', error);
//     throw error;
//   }
// };

// // Process referral bonus for a specific user and amount
// const processReferralBonus = async (userId, amount) => {
//   try {
//     const user = await User.findOne(userId);
//     if (!user || !user.referredBy) return;
    
//     // Get all referral bonus records for this user
//     const bonuses = await ReferralBonus.find({ referredUser: userId });
    
//     // Update each bonus record with calculated amount
//     for (const bonus of bonuses) {
//       const percentage = REFERRAL_BONUS_PERCENTAGES[bonus.level];
//       const bonusAmount = amount * percentage;
      
//       // Update bonus record
//       bonus.amount = bonusAmount;
//       await bonus.save();
      
//       // Update referrer's cash reward balance
//       const referrer = await User.find({userId: bonus.userId});
//       if (referrer) {
//         referrer.cashReward += bonusAmount;
//         referrer.totalBonus += bonusAmount;
//         await referrer.save();
//       }
//     }
//   } catch (error) {
//     console.error(`Error processing referral bonus for user ${userId}:`, error);
//     throw error;
//   }
// };

// // Get user's referral statistics
// exports.getUserReferralStats = async (userId) => {
//   try {
//     const user = await User.findOne(userId)
//       .populate('levelOneReferrals', 'username phone createdAt')
//       .populate('levelTwoReferrals', 'username phone createdAt')
//       .populate('levelThreeReferrals', 'username phone createdAt');
    
//     if (!user) {
//       throw new Error('User not found');
//     }
    
//     // Calculate total bonuses earned
//     const earnedBonuses = await ReferralBonus.aggregate([
//       { $match: { userId: user.userId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
    
//     const totalEarned = earnedBonuses.length > 0 ? earnedBonuses[0].total : 0;
    
//     // Calculate unclaimed bonuses
//     const unclaimedBonuses = await ReferralBonus.aggregate([
//       { $match: { userId: user.userId, isClaimed: false } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
    
//     const totalUnclaimed = unclaimedBonuses.length > 0 ? unclaimedBonuses[0].total : 0;
    
//     return {
//       referralCode: user.referralCode,
//       referredBy: user.referredBy,
//       levelOneCount: user.levelOneReferrals.length,
//       levelTwoCount: user.levelTwoReferrals.length,
//       levelThreeCount: user.levelThreeReferrals.length,
//       levelOneReferrals: user.levelOneReferrals,
//       levelTwoReferrals: user.levelTwoReferrals,
//       levelThreeReferrals: user.levelThreeReferrals,
//       totalEarned,
//       totalUnclaimed,
//       cashRewardBalance: user.cashReward
//     };
//   } catch (error) {
//     console.error('Error getting user referral stats:', error);
//     throw error;
//   }
// };

// Claim referral bonuses

exports.claimReferralBonuses = async (userId) => {
  try {
    const user = await User.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all unclaimed bonuses
    const unclaimedBonuses = await ReferralBonus.find({
        userId: user.userId,
      isClaimed: false
    });
    
    if (unclaimedBonuses.length === 0) {
      return { message: 'No unclaimed bonuses available' };
    }
    
    // Calculate total amount to claim
    const totalAmount = unclaimedBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Update user balance
    user.bonusAmount += totalAmount;
    user.cashReward -= totalAmount;
    await user.save();
    
    // Mark bonuses as claimed
    const now = new Date();
    await ReferralBonus.updateMany(
      { _id: { $in: unclaimedBonuses.map(b => b._id) } },
      { $set: { isClaimed: true, claimedAt: now } }
    );
    
    return {
      message: 'Bonuses claimed successfully',
      amount: totalAmount,
      newBalance: user.balance,
      bonusesClaimed: unclaimedBonuses.length
    };
  } catch (error) {
    console.error('Error claiming referral bonuses:', error);
    throw error;
  }
};




