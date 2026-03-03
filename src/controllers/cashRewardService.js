// services/cashRewardService.js

const Turnover = require('../models/Turnover');
const User = require('../models/User');

const TIER_PERCENTAGES = {
  tier1: 0.05, // 5%
  tier2: 0.03, // 3%
  tier3: 0.02, // 2%
};

exports.calculateDailyRewards = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // আজকের সমস্ত টার্নওভার বের করবো
    const todayTurnovers = await Turnover.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('user');

    for (const turnover of todayTurnovers) {
      const user = turnover.user;

      // তার Tier 1 রেফারার
      if (user.referredBy) {
        const referrerTier1 = await User.findOne({ referralCode: user.referredBy });
        if (referrerTier1) {
          const reward1 = turnover.amount * TIER_PERCENTAGES.tier1;
          referrerTier1.cashReward += reward1;
          await referrerTier1.save();
        }

        // তার Tier 2 রেফারার
        if (referrerTier1.referredBy) {
          const referrerTier2 = await User.findOne({ referralCode: referrerTier1.referredBy });
          if (referrerTier2) {
            const reward2 = turnover.amount * TIER_PERCENTAGES.tier2;
            referrerTier2.cashReward += reward2;
            await referrerTier2.save();
          }

          // তার Tier 3 রেফারার
          if (referrerTier2.referredBy) {
            const referrerTier3 = await User.findOne({ referralCode: referrerTier2.referredBy });
            if (referrerTier3) {
              const reward3 = turnover.amount * TIER_PERCENTAGES.tier3;
              referrerTier3.cashReward += reward3;
              await referrerTier3.save();
            }
          }
        }
      }
    }

    console.log('✅ Daily Cash Rewards Calculated Successfully');
  } catch (error) {
    console.error('❌ Error calculating daily rewards:', error);
  }
};






// // Calculate daily rewards
// exports.calculateDailyRewards = async () => {
//   try {
//     const now = new Date();
//     const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000)); // Convert to GMT+6
//     const yesterdayStart = new Date(gmt6Time);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);
//     yesterdayStart.setHours(22, 0, 0, 0); // 22:00 GMT+6
    
//     const yesterdayEnd = new Date(gmt6Time);
//     yesterdayEnd.setHours(21, 59, 59, 999); // 21:59 GMT+6

//     // Get all users with referrals
//     const referrers = await User.find({ 
//       $or: [
//         { referredBy: { $exists: true } },
//         { $expr: { $gt: [{ $size: "$referrals" }, 0] } }
//       ]
//     });

//     for (const referrer of referrers) {
//       // Get all tier 1 referrals
//       const tier1Referrals = await Referral.find({ referrer: referrer._id, tier: 1 });
//       const tier1Referees = tier1Referrals.map(r => r.referee);
      
//       // Get tier 1 turnover
//       const tier1Turnover = await Turnover.aggregate([
//         { 
//           $match: { 
//             user: { $in: tier1Referees },
//             date: { $gte: yesterdayStart, $lte: yesterdayEnd },
//             isSettled: true
//           }
//         },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);
      
//       const tier1Total = tier1Turnover[0]?.total || 0;
//       let tier1RewardRate = 0;
      
//       if (tier1Total >= 500000) tier1RewardRate = 0.0020;
//       else if (tier1Total >= 200000) tier1RewardRate = 0.0015;
//       else if (tier1Total >= 100) tier1RewardRate = 0.0010;
      
//       // Repeat for tier 2 and tier 3
//       // ... similar logic for tiers 2 and 3
      
//       const totalReward = (tier1Total * tier1RewardRate) + 
//                          (tier2Total * tier2RewardRate) + 
//                          (tier3Total * tier3RewardRate);
      
//       if (totalReward >= 0.01) { // Minimum payout
//         const reward = new Reward({
//           user: referrer._id,
//           amount: totalReward,
//           date: new Date(),
//           type: 'daily',
//           status: 'pending'
//         });
//         await reward.save();
//       }
//     }
    
//     console.log('Daily rewards calculated successfully');
//   } catch (error) {
//     console.error('Error calculating daily rewards:', error);
//   }
// };

// // Process referral bonuses
// exports.processReferralBonuses = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user.isVerified) return;
    
//     // Check if user was referred
//     const referral = await Referral.findOne({ referee: userId });
//     if (!referral) return;
    
//     // Check if referrer is verified
//     const referrer = await User.findById(referral.referrer);
//     if (!referrer.isVerified) return;
    
//     // Check requirements
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
//     // Check referrer turnover and deposit
//     const referrerTurnover = await Turnover.aggregate([
//       { $match: { user: referrer._id, date: { $gte: sevenDaysAgo } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
    
//     const referrerDeposit = await Deposit.aggregate([
//       { $match: { user: referrer._id, date: { $gte: sevenDaysAgo } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
    
//     // Check referee turnover
//     const refereeTurnover = await Turnover.aggregate([
//       { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
    
//     if (referrerTurnover[0]?.total >= 4250 && 
//         referrerDeposit[0]?.total >= 1000 && 
//         refereeTurnover[0]?.total >= 8500) {
      
//       // Check if bonus already paid
//       if (!referral.bonusPaid) {
//         // Credit bonus to referrer
//         referrer.walletBalance += 300;
//         await referrer.save();
        
//         // Mark bonus as paid
//         referral.bonusPaid = true;
//         await referral.save();
        
//         // Record reward
//         const reward = new Reward({
//           user: referrer._id,
//           amount: 300,
//           date: new Date(),
//           type: 'referral',
//           status: 'credited'
//         });
//         await reward.save();
//       }
//     }
//   } catch (error) {
//     console.error('Error processing referral bonus:', error);
//   }
// };