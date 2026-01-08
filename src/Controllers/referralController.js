// // const cron = require('node-cron');
// // const User = require('../Models/User');
// // const BettingHistory = require('../Models/BettingHistory');

// // const CASHBACK_TIERS = [
// //   { min: 500000, tier1: 0.20, tier2: 0.07, tier3: 0.03 },
// //   { min: 200000, tier1: 0.15, tier2: 0.06, tier3: 0.02 },
// //   { min: 100,    tier1: 0.10, tier2: 0.05, tier3: 0.01 }
// // ];

// // function getCashbackRate(tier, turnover) {
// //   for (const t of CASHBACK_TIERS) {
// //     if (turnover >= t.min) return t[`tier${tier}`];
// //   }
// //   return 0;
// // }

// // async function getReferrals(user) {
// //   const level1 = await User.find({ referredBy: user.referralCode }).lean();
// //   const level2 = await User.find({ referredBy: { $in: level1.map(u => u.referralCode) } }).lean();
// //   const level3 = await User.find({ referredBy: { $in: level2.map(u => u.referralCode) } }).lean();
// //     console.log("level1",level1,"level",level2,"level3",level3)
// //   return { level1, level2, level3 };
// // }

// // async function getTurnover(userIds, from, to) {
// //   return await BettingHistory.aggregate([
// //     {
// //       $match: {
// //         member: { $in: userIds },
// //         start_time: { $gte: from, $lt: to },
// //         product: { $nin: ['excluded_market'] }, // Replace if needed
// //       }
// //     },
// //     {
// //       $group: {
// //         _id: null,
// //         total: { $sum: "$turnover" }
// //       }
// //     }
// //   ]);
// // }

// // const runDailyCashback = async () => {
// //   try {
// //     const from = new Date();
// //     from.setDate(from.getDate() - 1);
// //     from.setHours(22, 0, 0, 0);

// //     const to = new Date(from);
// //     to.setDate(to.getDate() + 1);
// //     to.setHours(21, 59, 59, 999);

// //     const users = await User.find({}).lean();

// //     for (const user of users) {
// //       const { level1, level2, level3 } = await getReferrals(user);

// //       const level1Turnover = await getTurnover(level1.map(u => u.userId), from, to);
// //       const level2Turnover = await getTurnover(level2.map(u => u.userId), from, to);
// //       const level3Turnover = await getTurnover(level3.map(u => u.userId), from, to);

// //       const t1 = level1Turnover[0]?.total || 0;
// //       const t2 = level2Turnover[0]?.total || 0;
// //       const t3 = level3Turnover[0]?.total || 0;

// //       const c1 = getCashbackRate(1, t1);
// //       const c2 = getCashbackRate(2, t2);
// //       const c3 = getCashbackRate(3, t3);

// //       const cashback = t1 * c1 + t2 * c2 + t3 * c3;
// // console.log(cashback)
// //       if (cashback > 0) {
// //         await User.updateOne({ userId: user.userId }, { $inc: { cashReward: cashback } });
// //         console.log(`Cashback of ${cashback.toFixed(2)} added to ${user.userId}`);
// //       }
// //     }

// //     console.log("✅ Daily cashback processed at", new Date().toLocaleString());
// //   } catch (err) {
// //     console.error("❌ Cashback Cron Job Error:", err);
// //   }
// // };

// // // Schedule it for 03:00 AM (GMT+6) daily => 21:00 GMT
// // cron.schedule('* * * * *', runDailyCashback); // 03:00 BD Time (GMT+6)

// // module.exports = runDailyCashback;
// const { getReferralOwner } = require('../utils/referralUtils');
// const User = require('../models/User');
// const SubAdmin = require('../models/SubAdminModel');
// const AffiliateModel = require('../models/AffiliateModel');
// const AdminModel = require('../models/AdminModel');

// class ReferralController {
//     // Get referral owner information
//     static async getReferralOwnerInfo(req, res) {
//         try {
//             const { referralCode } = req.params;

//             const ownerInfo = await getReferralOwner(referralCode);
            
//             if (!ownerInfo) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Referral owner not found'
//                 });
//             }

//             res.json({
//                 success: true,
//                 data: ownerInfo
//             });
//         } catch (error) {
//             console.error('Get referral owner error:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error'
//             });
//         }
//     }

//     // Get referral statistics
//     static async getReferralStats(req, res) {
//         try {
//             const { userId } = req.params;

//             const user = await User.findOne({ userId });
//             if (!user) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'User not found'
//                 });
//             }

//             const levelOneCount = await User.countDocuments({ referredBy: user.referralCode });
            
//             const levelTwoUsers = await User.find({ referredBy: user.referralCode });
//             let levelTwoCount = 0;
            
//             for (const levelOneUser of levelTwoUsers) {
//                 const count = await User.countDocuments({ referredBy: levelOneUser.referralCode });
//                 levelTwoCount += count;
//             }

//             let levelThreeCount = 0;
//             for (const levelOneUser of levelTwoUsers) {
//                 const levelTwoRefs = await User.find({ referredBy: levelOneUser.referralCode });
//                 for (const levelTwoUser of levelTwoRefs) {
//                     const count = await User.countDocuments({ referredBy: levelTwoUser.referralCode });
//                     levelThreeCount += count;
//                 }
//             }

//             const stats = {
//                 levelOne: levelOneCount,
//                 levelTwo: levelTwoCount,
//                 levelThree: levelThreeCount,
//                 totalReferrals: levelOneCount + levelTwoCount + levelThreeCount,
//                 totalCommission: user.totalBonus || 0
//             };

//             res.json({
//                 success: true,
//                 data: stats
//             });
//         } catch (error) {
//             console.error('Get referral stats error:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error'
//             });
//         }
//     }

//     // Get top referrers
//     static async getTopReferrers(req, res) {
//         try {
//             const { limit = 10 } = req.query;

//             const topReferrers = await User.aggregate([
//                 {
//                     $project: {
//                         userId: 1,
//                         name: 1,
//                         referralCode: 1,
//                         totalReferrals: {
//                             $add: [
//                                 { $size: '$levelOneReferrals' },
//                                 { $size: '$levelTwoReferrals' },
//                                 { $size: '$levelThreeReferrals' }
//                             ]
//                         },
//                         totalBonus: 1
//                     }
//                 },
//                 { $sort: { totalReferrals: -1, totalBonus: -1 } },
//                 { $limit: parseInt(limit) }
//             ]);

//             res.json({
//                 success: true,
//                 data: topReferrers
//             });
//         } catch (error) {
//             console.error('Get top referrers error:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error'
//             });
//         }
//     }

//     // Validate referral code
//     static async validateReferralCode(req, res) {
//         try {
//             const { referralCode } = req.params;

//             // Check in all models
//             const [user, subAdmin, affiliate, admin] = await Promise.all([
//                 User.findOne({ referralCode }),
//                 SubAdmin.findOne({ referralCode }),
//                 AffiliateModel.findOne({ referralCode }),
//                 AdminModel.findOne({ referralCode })
//             ]);

//             const isValid = !!(user || subAdmin || affiliate || admin);
//             let ownerInfo = null;

//             if (user) ownerInfo = { type: 'user', name: user.name, userId: user.userId };
//             else if (subAdmin) ownerInfo = { type: 'subAdmin', name: subAdmin.name };
//             else if (affiliate) ownerInfo = { type: 'affiliate', name: `${affiliate.firstName} ${affiliate.lastName}` };
//             else if (admin) ownerInfo = { type: 'admin', name: admin.firstName };

//             res.json({
//                 success: true,
//                 data: {
//                     isValid,
//                     ownerInfo
//                 }
//             });
//         } catch (error) {
//             console.error('Validate referral code error:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error'
//             });
//         }
//     }
// }

// module.exports = ReferralController;


const ReferralBonus = require('../models/ReferralBonus');
const ReferralStats = require('../models/ReferralStats');
const User = require('../models/User');
const BonusWallet = require('../models/BonusWallet');
const ReferralAchievement = require('../models/ReferralAchievement');

class ReferralController {
  // Get referral dashboard data
  async getDashboard(req, res) {
    try {
      const { userId } = req.user;
      console.log(" getDashboard referral userId", userId);
      // Get referral stats
      const stats = await ReferralStats.findOne({ userId }) || 
        await ReferralStats.create({ userId });
      
      // Get user data
      const user = await User.findOne({ userId }).select('referralCode levelOneReferrals levelTwoReferrals levelThreeReferrals');
      console.log(" getDashboard referral user", user);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

   const st = await ReferralBonus.findOne({ referredUser: userId });
   console.log(" getDashboard referral st", st);
      // Get pending bonus amount
      const pendingBonus = await BonusWallet.aggregate([
        {
          $match: {
            userId,
            status: 'active',
            claimable: true,
            balance: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$balance' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Calculate today's rebate from betting history
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayRebate = await ReferralBonus.aggregate([
        {
          $match: {
            userId,
            bonusType: 'betting_rebate',
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'available'
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$bonusAmount' }
          }
        }
      ]);
      
      // Calculate yesterday's rebate
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayRebate = await ReferralBonus.aggregate([
        {
          $match: {
            userId,
            bonusType: 'betting_rebate',
            createdAt: { $gte: yesterday, $lt: today },
            status: 'available'
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$bonusAmount' }
          }
        }
      ]);
      
      // Get monthly achievements
      const achievements = await ReferralAchievement.find({
        userId,
        achievementType: 'monthly',
        expiresAt: { $gt: new Date() }
      });
      
      // Update stats
      stats.todayRebate = {
        amount: todayRebate[0]?.amount || 0,
        date: today
      };
      
      stats.yesterdayRebate = {
        amount: yesterdayRebate[0]?.amount || 0,
        date: yesterday
      };
      
      stats.pendingBonus = {
        amount: pendingBonus[0]?.total || 0,
        count: pendingBonus[0]?.count || 0
      };
      
      await stats.save();
      
      res.json({
        success: true,
        data: {
          referralCode: user.referralCode,
          stats: {
            friendsInvited: stats.totalInvited,
            friendsCompleted: stats.totalCompleted,
            todayRebate: stats.todayRebate.amount,
            yesterdayRebate: stats.yesterdayRebate.amount,
            canClaimBonus: stats.pendingBonus.amount
          },
          achievements: achievements.map(ach => ({
            id: ach.achievementId,
            title: ach.title,
            current: ach.current,
            target: ach.target,
            progress: ach.progress,
            bonusAmount: ach.bonusAmount,
            status: ach.status
          })),
          invitationUrl: `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  // Get referral details with filters
  async getDetails(req, res) {
    try {
      const { userId } = req.user;
      const {
        bonusType = 'all',
        status = 'all',
        dateOption = 'today',
        page = 1,
        limit = 20
      } = req.query;
      
      // Build query
      const query = { userId };
      
      // Filter by bonus type
      if (bonusType !== 'all') {
        query.bonusType = bonusType;
      }
      
      // Filter by status
      if (status !== 'all') {
        query.status = status;
      }
      
      // Filter by date
      const dateFilter = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateOption) {
        case 'today':
          dateFilter.$gte = today;
          dateFilter.$lt = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          dateFilter.$gte = yesterday;
          dateFilter.$lt = today;
          break;
        case 'last7days':
          const last7days = new Date(today);
          last7days.setDate(last7days.getDate() - 7);
          dateFilter.$gte = last7days;
          dateFilter.$lt = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (req.query.startDate && req.query.endDate) {
            dateFilter.$gte = new Date(req.query.startDate);
            dateFilter.$lt = new Date(new Date(req.query.endDate).getTime() + 24 * 60 * 60 * 1000);
          }
          break;
      }
      
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }
      
      // Pagination
      const skip = (page - 1) * limit;
      
      // Get referral bonuses
      const bonuses = await ReferralBonus.find(query)
        .populate('referredUser', 'userId name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count
      const total = await ReferralBonus.countDocuments(query);
      
      res.json({
        success: true,
        data: bonuses.map(bonus => ({
          id: bonus._id,
          bonusType: bonus.bonusType,
          referredUser: bonus.referredUser?.userId || 'N/A',
          username: bonus.referredUser?.name || 'N/A',
          amount: bonus.bonusAmount,
          status: bonus.status,
          level: bonus.level,
          createdAt: bonus.createdAt,
          conditionsMet: bonus.conditionsMet
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Details error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  // Claim bonus
  async claimBonus(req, res) {
    try {
      const { userId } = req.user;
      const { bonusId } = req.body;
      
      let bonus;
      
      if (bonusId) {
        // Claim specific bonus
        bonus = await ReferralBonus.findOne({
          _id: bonusId,
          userId,
          status: 'available'
        });
        
        if (!bonus) {
          return res.status(404).json({ 
            success: false, 
            message: 'Bonus not found or already claimed' 
          });
        }
        
        bonus.status = 'claimed';
        bonus.claimedAt = new Date();
        await bonus.save();
      } else {
        // Claim all available bonuses
        const bonuses = await ReferralBonus.find({
          userId,
          status: 'available'
        });
        
        if (bonuses.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'No bonuses available to claim' 
          });
        }
        
        // Update all bonuses
        await ReferralBonus.updateMany(
          { _id: { $in: bonuses.map(b => b._id) } },
          { 
            $set: { 
              status: 'claimed',
              claimedAt: new Date()
            }
          }
        );
        
        // Calculate total amount
        const totalAmount = bonuses.reduce((sum, b) => sum + b.bonusAmount, 0);
        
        // Add to user balance
        await User.findOneAndUpdate(
          { userId },
          { $inc: { balance: totalAmount } }
        );
        
        // Update bonus wallet
        await BonusWallet.create({
          userId,
          bonusType: 'referral',
          amount: totalAmount,
          balance: 0,
          status: 'claimed',
          claimable: false,
          claimedAt: new Date(),
          metadata: {
            referralCode: user.referralCode,
            bonusesClaimed: bonuses.length
          }
        });
        
        return res.json({
          success: true,
          message: `Successfully claimed ${totalAmount.toFixed(2)} bonus!`,
          data: {
            claimedAmount: totalAmount,
            claimedCount: bonuses.length
          }
        });
      }
      
      // Add to user balance
      await User.findOneAndUpdate(
        { userId },
        { $inc: { balance: bonus.bonusAmount } }
      );
      
      // Update bonus wallet
      await BonusWallet.create({
        userId,
        bonusType: 'referral',
        amount: bonus.bonusAmount,
        balance: 0,
        status: 'claimed',
        claimable: false,
        claimedAt: new Date(),
        metadata: {
          referralCode: user.referralCode,
          referredUser: bonus.referredUser
        }
      });
      
      res.json({
        success: true,
        message: `Successfully claimed ${bonus.bonusAmount.toFixed(2)} bonus!`,
        data: {
          claimedAmount: bonus.bonusAmount
        }
      });
    } catch (error) {
      console.error('Claim bonus error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  // Get referral requirements
  async getRequirements(req, res) {
    try {
      const requirements = {
        totalDeposit: 2000,
        totalTurnover: 5000,
        withinDays: 7,
        emailVerified: true,
        phoneVerified: true
      };
      
      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      console.error('Requirements error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  // Get commission table
  async getCommissionTable(req, res) {
    try {
      const commissionTable = [
        {
          turnover: '৳ 100 - ৳ 25,000',
          tier1: '0.15%',
          tier2: '0.10%',
          tier3: '0.05%'
        },
        {
          turnover: '৳ 25,001 - ৳ 50,000',
          tier1: '0.25%',
          tier2: '0.15%',
          tier3: '0.10%'
        },
        {
          turnover: '৳ 50,001+',
          tier1: '0.35%',
          tier2: '0.25%',
          tier3: '0.20%'
        }
      ];
      
      res.json({
        success: true,
        data: commissionTable
      });
    } catch (error) {
      console.error('Commission table error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
  
  // Get monthly achievements
  async getAchievements(req, res) {
    try {
      const { userId } = req.user;
      
      const achievements = await ReferralAchievement.find({
        userId,
        achievementType: 'monthly',
        expiresAt: { $gt: new Date() }
      }).sort({ target: 1 });
      
      // If no achievements exist, create default ones
      if (achievements.length === 0) {
        const defaultAchievements = [
          {
            achievementId: 'monthly_1',
            title: 'Agent Achievement 5',
            target: 5,
            bonusAmount: 177.00,
            expiresAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          },
          {
            achievementId: 'monthly_2',
            title: 'Agent Achievement 10',
            target: 10,
            bonusAmount: 377.00,
            expiresAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          },
          {
            achievementId: 'monthly_3',
            title: 'Agent Achievement 15',
            target: 15,
            bonusAmount: 777.00,
            expiresAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          }
        ];
        
        const createdAchievements = await ReferralAchievement.insertMany(
          defaultAchievements.map(ach => ({
            ...ach,
            userId,
            achievementType: 'monthly',
            status: 'locked'
          }))
        );
        
        res.json({
          success: true,
          data: createdAchievements.map(ach => ({
            id: ach.achievementId,
            title: ach.title,
            current: ach.current,
            target: ach.target,
            progress: ach.progress,
            bonusAmount: ach.bonusAmount,
            status: ach.status
          }))
        });
      } else {
        res.json({
          success: true,
          data: achievements.map(ach => ({
            id: ach.achievementId,
            title: ach.title,
            current: ach.current,
            target: ach.target,
            progress: ach.progress,
            bonusAmount: ach.bonusAmount,
            status: ach.status
          }))
        });
      }
    } catch (error) {
      console.error('Achievements error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new ReferralController();