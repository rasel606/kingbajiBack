// const cron = require('node-cron');
// const User = require('../Models/User');
// const BettingHistory = require('../Models/BettingHistory');

// const CASHBACK_TIERS = [
//   { min: 500000, tier1: 0.20, tier2: 0.07, tier3: 0.03 },
//   { min: 200000, tier1: 0.15, tier2: 0.06, tier3: 0.02 },
//   { min: 100,    tier1: 0.10, tier2: 0.05, tier3: 0.01 }
// ];

// function getCashbackRate(tier, turnover) {
//   for (const t of CASHBACK_TIERS) {
//     if (turnover >= t.min) return t[`tier${tier}`];
//   }
//   return 0;
// }

// async function getReferrals(user) {
//   const level1 = await User.find({ referredBy: user.referralCode }).lean();
//   const level2 = await User.find({ referredBy: { $in: level1.map(u => u.referralCode) } }).lean();
//   const level3 = await User.find({ referredBy: { $in: level2.map(u => u.referralCode) } }).lean();
//     console.log("level1",level1,"level",level2,"level3",level3)
//   return { level1, level2, level3 };
// }

// async function getTurnover(userIds, from, to) {
//   return await BettingHistory.aggregate([
//     {
//       $match: {
//         member: { $in: userIds },
//         start_time: { $gte: from, $lt: to },
//         product: { $nin: ['excluded_market'] }, // Replace if needed
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$turnover" }
//       }
//     }
//   ]);
// }

// const runDailyCashback = async () => {
//   try {
//     const from = new Date();
//     from.setDate(from.getDate() - 1);
//     from.setHours(22, 0, 0, 0);

//     const to = new Date(from);
//     to.setDate(to.getDate() + 1);
//     to.setHours(21, 59, 59, 999);

//     const users = await User.find({}).lean();

//     for (const user of users) {
//       const { level1, level2, level3 } = await getReferrals(user);

//       const level1Turnover = await getTurnover(level1.map(u => u.userId), from, to);
//       const level2Turnover = await getTurnover(level2.map(u => u.userId), from, to);
//       const level3Turnover = await getTurnover(level3.map(u => u.userId), from, to);

//       const t1 = level1Turnover[0]?.total || 0;
//       const t2 = level2Turnover[0]?.total || 0;
//       const t3 = level3Turnover[0]?.total || 0;

//       const c1 = getCashbackRate(1, t1);
//       const c2 = getCashbackRate(2, t2);
//       const c3 = getCashbackRate(3, t3);

//       const cashback = t1 * c1 + t2 * c2 + t3 * c3;
// console.log(cashback)
//       if (cashback > 0) {
//         await User.updateOne({ userId: user.userId }, { $inc: { cashReward: cashback } });
//         console.log(`Cashback of ${cashback.toFixed(2)} added to ${user.userId}`);
//       }
//     }

//     console.log("✅ Daily cashback processed at", new Date().toLocaleString());
//   } catch (err) {
//     console.error("❌ Cashback Cron Job Error:", err);
//   }
// };

// // Schedule it for 03:00 AM (GMT+6) daily => 21:00 GMT
// cron.schedule('* * * * *', runDailyCashback); // 03:00 BD Time (GMT+6)

// module.exports = runDailyCashback;
const { getReferralOwner } = require('../utils/referralUtils');
const User = require('../models/User');
const SubAdmin = require('../models/SubAdmin');
const AffiliateModel = require('../models/AffiliateModel');
const AdminModel = require('../models/AdminModel');

class ReferralController {
    // Get referral owner information
    static async getReferralOwnerInfo(req, res) {
        try {
            const { referralCode } = req.params;

            const ownerInfo = await getReferralOwner(referralCode);
            
            if (!ownerInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Referral owner not found'
                });
            }

            res.json({
                success: true,
                data: ownerInfo
            });
        } catch (error) {
            console.error('Get referral owner error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    // Get referral statistics
    static async getReferralStats(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findOne({ userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const levelOneCount = await User.countDocuments({ referredBy: user.referralCode });
            
            const levelTwoUsers = await User.find({ referredBy: user.referralCode });
            let levelTwoCount = 0;
            
            for (const levelOneUser of levelTwoUsers) {
                const count = await User.countDocuments({ referredBy: levelOneUser.referralCode });
                levelTwoCount += count;
            }

            let levelThreeCount = 0;
            for (const levelOneUser of levelTwoUsers) {
                const levelTwoRefs = await User.find({ referredBy: levelOneUser.referralCode });
                for (const levelTwoUser of levelTwoRefs) {
                    const count = await User.countDocuments({ referredBy: levelTwoUser.referralCode });
                    levelThreeCount += count;
                }
            }

            const stats = {
                levelOne: levelOneCount,
                levelTwo: levelTwoCount,
                levelThree: levelThreeCount,
                totalReferrals: levelOneCount + levelTwoCount + levelThreeCount,
                totalCommission: user.totalBonus || 0
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get referral stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    // Get top referrers
    static async getTopReferrers(req, res) {
        try {
            const { limit = 10 } = req.query;

            const topReferrers = await User.aggregate([
                {
                    $project: {
                        userId: 1,
                        name: 1,
                        referralCode: 1,
                        totalReferrals: {
                            $add: [
                                { $size: '$levelOneReferrals' },
                                { $size: '$levelTwoReferrals' },
                                { $size: '$levelThreeReferrals' }
                            ]
                        },
                        totalBonus: 1
                    }
                },
                { $sort: { totalReferrals: -1, totalBonus: -1 } },
                { $limit: parseInt(limit) }
            ]);

            res.json({
                success: true,
                data: topReferrers
            });
        } catch (error) {
            console.error('Get top referrers error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    // Validate referral code
    static async validateReferralCode(req, res) {
        try {
            const { referralCode } = req.params;

            // Check in all models
            const [user, subAdmin, affiliate, admin] = await Promise.all([
                User.findOne({ referralCode }),
                SubAdmin.findOne({ referralCode }),
                AffiliateModel.findOne({ referralCode }),
                AdminModel.findOne({ referralCode })
            ]);

            const isValid = !!(user || subAdmin || affiliate || admin);
            let ownerInfo = null;

            if (user) ownerInfo = { type: 'user', name: user.name, userId: user.userId };
            else if (subAdmin) ownerInfo = { type: 'subAdmin', name: subAdmin.name };
            else if (affiliate) ownerInfo = { type: 'affiliate', name: `${affiliate.firstName} ${affiliate.lastName}` };
            else if (admin) ownerInfo = { type: 'admin', name: admin.firstName };

            res.json({
                success: true,
                data: {
                    isValid,
                    ownerInfo
                }
            });
        } catch (error) {
            console.error('Validate referral code error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
}

module.exports = ReferralController;