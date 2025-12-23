// const vipService = require('../Services/VipService');
// const validator = require('../validators/vipValidator');
// const logger = require('../utils/logger');

// // Get user VIP status
// exports.getVipStatus = async (req, res) => {
//   try {
//     // console.log("getVipStatus", req.params.userId);
//     const { error } = validator.getStatusSchema.validate(req.params);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const status = await vipService.getUserVipStatus(req.params.userId);
//     res.json(status);
//   } catch (error) {
//     logger.error(`getVipStatus controller error: ${error.message}`);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Convert VIP points to money
// exports.convertPoints = async (req, res) => {
//   try {
//     // console.log("convertPoints", req.body);
//     const { error } = validator.convertPointsSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const result = await vipService.convertVipPoints(req.body.userId, req.body.amount);
//     res.json(result);
//   } catch (error) {
//     const status = error.message.includes('not found') ? 404 : 400;
//     res.status(status).json({ error: error.message });
//   }
// };

// // Manually adjust VIP points
// exports.adjustPoints = async (req, res) => {
//   try {
//     // console.log("adjustPoints", req.body);
//     const { error } = validator.adjustPointsSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const result = await vipService.adjustVipPoints(
//       req.body.userId,
//       req.body.amount,
//       req.body.description
//     );
//     res.json(result);
//   } catch (error) {
//     const status = error.message.includes('not found') ? 404 : 400;
//     res.status(status).json({ error: error.message });
//   }
// };

// // Update VIP level
// exports.updateLevel = async (req, res) => {
//   try {
//     // console.log("updateLevel", req.body);
//     const { error } = validator.updateLevelSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const result = await vipService.updateVipLevel(
//       req.body.userId,
//       req.body.newLevel,
//       req.body.isManual
//     );
//     res.json(result);
//   } catch (error) {
//     const status = error.message.includes('not found') ? 404 : 400;
//     res.status(status).json({ error: error.message });
//   }
// };

// // Run daily VIP calculation (admin)
// // exports.runDailyCalculation = async (req, res) => {
// //   try {
// //     console.log("runDailyCalculation");
// //     const result = await vipService.calculateDailyVipPoints();
// //     res.json(result);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// // Run monthly VIP processing (admin)
// exports.runMonthlyProcessing = async (req, res) => {
//   try {
//     // console.log("runMonthlyProcessing");
//     const result = await vipService.processMonthlyVipBonuses();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get all VIP levels
// exports.getVipLevels = async (req, res) => {
//   try {
//     // console.log("getVipLevels");
//     const levels = await vipService.getVipLevels();
//     res.json(levels);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// controllers/vipUserController.js
// const UserVip = require('../models/UserVip');
// const Transaction = require('../models/VipPointTransaction'); // You'll need to create this model
// const mongoose = require('mongoose');

// class VipUserController {
//   // Get current user VIP data
//   static async getMyVipData(req, res) {
//     try {
//       const userId = req.user.userId; // From auth middleware
//       console.log("Fetching VIP data for user:", req.user);
//       // Find or create VIP record
//       let userVip = await UserVip.findOne({ userId });

//       if (!userVip) {
//         // Create new VIP record if doesn't exist
//         userVip = await UserVip.create({
//           userId,
//           currentLevel: 'Bronze',
//           vipPoints: 0,
//           monthlyTurnover: 0,
//           lifetimeTurnover: 0,
//           lastMonthTurnover: 0
//         });
//       }

//       // Calculate experience (based on monthly turnover)
//       const experience = userVip.monthlyTurnover;

//       // Get next level requirement
//       const { VIP_CONFIG } = require('../models/UserVip');
//       const nextLevel = this.getNextLevel(userVip.currentLevel);
//       const nextLevelExperience = VIP_CONFIG[nextLevel]?.minTurnover || 0;

//       // Get VIP level hierarchy
//       const levelHierarchy = this.getLevelHierarchy(userVip.currentLevel);

//       // Prepare response matching frontend structure
//       const vipData = {
//         currentLevel: userVip.currentLevel,
//         currentPoints: userVip.vipPoints,
//         experience: experience,
//         nextLevel: nextLevel,
//         nextLevelExperience: nextLevelExperience,
//         minConversionPoints: 1000, // Minimum points required for conversion
//         conversionRatio: '1000:1', // 1000 VP = 1 currency unit
//         levelHierarchy: levelHierarchy,
//         monthlyTurnover: userVip.monthlyTurnover,
//         lifetimeTurnover: userVip.lifetimeTurnover,
//         lastMonthTurnover: userVip.lastMonthTurnover,
//         levelIcon: this.getLevelIcon(userVip.currentLevel),
//         progressPercentage: (experience / nextLevelExperience) * 100 || 0
//       };

//       res.json({
//         success: true,
//         data: vipData
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get VIP points records (received/used)
//   static async getVipPointsRecords(req, res) {
//     try {
//       const userId = req.user.id;
//       const { type = 'received', page = 1, limit = 20 } = req.query;

//       // You need a Transaction model to store point transactions
//       const query = {
//         userId,
//         transactionType: 'vip_points'
//       };

//       if (type === 'received') {
//         query.amount = { $gt: 0 };
//       } else if (type === 'used') {
//         query.amount = { $lt: 0 };
//       }

//       const transactions = await Transaction.find(query)
//         .sort({ createdAt: -1 })
//         .limit(parseInt(limit))
//         .skip((parseInt(page) - 1) * parseInt(limit));

//       const total = await Transaction.countDocuments(query);

//       // Format transactions for frontend
//       const records = transactions.map(transaction => ({
//         id: transaction._id,
//         date: transaction.createdAt,
//         points: Math.abs(transaction.amount),
//         type: transaction.amount > 0 ? 'received' : 'used',
//         description: transaction.description || 'VIP Points Transaction',
//         status: transaction.status || 'completed'
//       }));

//       res.json({
//         success: true,
//         data: records,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get VIP level history
//   static async getVipHistory(req, res) {
//     try {
//       const userId = req.user.id;

//       // You should create a VIPHistory model to track level changes
//       // For now, using the UserVip model with monthly aggregation

//       const vipHistory = await UserVip.aggregate([
//         { $match: { userId: userId } },
//         {
//           $lookup: {
//             from: 'vip_monthly_snapshots', // Create this collection
//             localField: 'userId',
//             foreignField: 'userId',
//             as: 'snapshots'
//           }
//         },
//         { $unwind: '$snapshots' },
//         {
//           $project: {
//             year: { $year: '$snapshots.createdAt' },
//             month: { $month: '$snapshots.createdAt' },
//             level: '$snapshots.level',
//             experience: '$snapshots.monthlyTurnover',
//             turnover: '$snapshots.monthlyTurnover'
//           }
//         },
//         { $sort: { year: -1, month: -1 } }
//       ]);

//       // If no history, create from current data
//       if (vipHistory.length === 0) {
//         const userVip = await UserVip.findOne({ userId });
//         const currentDate = new Date();

//         vipHistory.push({
//           year: currentDate.getFullYear(),
//           month: currentDate.getMonth() + 1,
//           level: userVip.currentLevel,
//           experience: userVip.monthlyTurnover,
//           turnover: userVip.monthlyTurnover
//         });
//       }

//       // Format for frontend
//       const formattedHistory = vipHistory.map(record => ({
//         year: record.year,
//         month: this.getMonthName(record.month),
//         level: record.level,
//         experience: record.experience,
//         turnover: record.turnover
//       }));

//       res.json({
//         success: true,
//         data: formattedHistory
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Convert VIP points to real money
//   static async convertPoints(req, res) {
//     try {
//       const userId = req.user.id;
//       const { points } = req.body;

//       if (!points || points <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid points amount'
//         });
//       }

//       // Get user VIP data
//       const userVip = await UserVip.findOne({ userId });

//       if (!userVip) {
//         return res.status(404).json({
//           success: false,
//           message: 'VIP record not found'
//         });
//       }

//       // Check minimum points
//       const minPoints = 1000; // Minimum conversion amount
//       if (points < minPoints) {
//         return res.status(400).json({
//           success: false,
//           message: `Minimum ${minPoints} points required for conversion`
//         });
//       }

//       // Check if user has enough points
//       if (userVip.vipPoints < points) {
//         return res.status(400).json({
//           success: false,
//           message: 'Insufficient VIP points'
//         });
//       }

//       // Conversion rate: 1000 points = 1 currency unit
//       const conversionRate = 1000;
//       const amount = points / conversionRate;

//       // Start transaction
//       const session = await mongoose.startSession();
//       session.startTransaction();

//       try {
//         // Deduct points
//         userVip.vipPoints -= points;
//         userVip.lastTransactionType = 'points_conversion';
//         userVip.lastTransactionAmount = -points;
//         userVip.lastTransactionDate = new Date();
//         await userVip.save({ session });

//         // Create transaction record for points deduction
//         await Transaction.create([{
//           userId,
//           type: 'vip_points_conversion',
//           amount: -points,
//           description: `Converted ${points} VIP points to real money`,
//           status: 'completed',
//           metadata: {
//             conversionRate,
//             pointsConverted: points,
//             amountReceived: amount
//           }
//         }], { session });

//         // Add real money to user wallet
//         // You need to implement your wallet system
//         await this.addToWallet(userId, amount, 'VIP points conversion', session);

//         await session.commitTransaction();

//         res.json({
//           success: true,
//           message: 'Points converted successfully',
//           data: {
//             pointsConverted: points,
//             amountReceived: amount,
//             newPointsBalance: userVip.vipPoints
//           }
//         });

//       } catch (transactionError) {
//         await session.abortTransaction();
//         throw transactionError;
//       } finally {
//         session.endSession();
//       }

//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get conversion preview
//   static async getConversionPreview(req, res) {
//     try {
//       const { points } = req.query;

//       if (!points || points <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid points amount'
//         });
//       }

//       const conversionRate = 1000; // 1000 points = 1 currency unit
//       const amount = points / conversionRate;

//       res.json({
//         success: true,
//         data: {
//           points: parseInt(points),
//           amount: amount,
//           conversionRate: conversionRate,
//           formattedAmount: `$${amount.toFixed(2)}` // Or your currency
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get VIP level benefits
//   static async getLevelBenefits(req, res) {
//     try {
//       const userId = req.user.id;
//       const userVip = await UserVip.findOne({ userId });

//       const level = userVip?.currentLevel || 'Bronze';

//       const benefits = {
//         Bronze: {
//           name: 'Bronze',
//           icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-1.svg',
//           pointsMultiplier: 1.0,
//           benefits: [
//             'Daily check-in bonus',
//             'Basic customer support',
//             'Weekly promotions'
//           ],
//           monthlyTurnoverRequired: 0,
//           nextLevel: 'Silver'
//         },
//         Silver: {
//           name: 'Silver',
//           icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-2.svg',
//           pointsMultiplier: 1.2,
//           benefits: [
//             'All Bronze benefits',
//             'Higher points earning rate',
//             'Faster withdrawals',
//             'Monthly cashback'
//           ],
//           monthlyTurnoverRequired: 50000,
//           nextLevel: 'Gold'
//         },
//         Gold: {
//           name: 'Gold',
//           icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-3.svg',
//           pointsMultiplier: 1.5,
//           benefits: [
//             'All Silver benefits',
//             'Personal account manager',
//             'Exclusive tournaments',
//             'Higher deposit limits'
//           ],
//           monthlyTurnoverRequired: 100000,
//           nextLevel: 'Diamond'
//         },
//         Diamond: {
//           name: 'Diamond',
//           icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-4.svg',
//           pointsMultiplier: 1.8,
//           benefits: [
//             'All Gold benefits',
//             'VIP events invitation',
//             'Luxury gifts',
//             'Instant withdrawals'
//           ],
//           monthlyTurnoverRequired: 500000,
//           nextLevel: 'Elite'
//         },
//         Elite: {
//           name: 'Elite',
//           icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-5.svg',
//           pointsMultiplier: 2.0,
//           benefits: [
//             'All Diamond benefits',
//             'Concierge service',
//             'Private jet offers',
//             'Customized rewards'
//           ],
//           monthlyTurnoverRequired: 1000000,
//           nextLevel: null
//         }
//       };

//       res.json({
//         success: true,
//         data: {
//           currentLevel: benefits[level],
//           allLevels: benefits,
//           userProgress: {
//             currentTurnover: userVip?.monthlyTurnover || 0,
//             nextLevelTurnover: benefits[level]?.monthlyTurnoverRequired || 0,
//             progressPercentage: userVip ?
//               (userVip.monthlyTurnover / benefits[level]?.monthlyTurnoverRequired) * 100 : 0
//           }
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Helper methods
//   static getNextLevel(currentLevel) {
//     const levels = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'];
//     const currentIndex = levels.indexOf(currentLevel);
//     return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
//   }

//   static getLevelHierarchy(currentLevel) {
//     const levels = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'];
//     return levels.map(level => ({
//       level,
//       isCurrent: level === currentLevel,
//       isUnlocked: levels.indexOf(level) <= levels.indexOf(currentLevel)
//     }));
//   }

//   static getLevelIcon(level) {
//     const icons = {
//       'Bronze': 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-1.svg?v=1761636564965',
//       'Silver': 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-2.svg?v=1761636564965',
//       'Gold': 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-3.svg?v=1761636564965',
//       'Diamond': 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-4.svg?v=1761636564965',
//       'Elite': 'https://img.s628b.com/sb/h5/assets/images/icon-set/player/vip/vip-sidenav-5.svg?v=1761636564965'
//     };
//     return icons[level] || icons.Bronze;
//   }

//   static getMonthName(monthNumber) {
//     const months = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return months[monthNumber - 1] || 'Unknown';
//   }

//   static async addToWallet(userId, amount, description, session) {
//     // Implement your wallet addition logic here
//     // This should add money to user's main wallet
//     console.log(`Adding ${amount} to wallet for user ${userId}: ${description}`);
//     return Promise.resolve();
//   }
// }

// module.exports = VipUserController;

const User = require("../models/User");
const UserVip = require("../models/UserVip");
const VipPointTransaction = require("../models/VipPointTransaction"); // You'll need to create this model
const mongoose = require("mongoose");
const vipService = require("../services/VipService");
exports.getMyVipData = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(userId);
    let vip = await UserVip.findOne({ userId });
    // if (!vip) {
    //   vip = await UserVip.create({ userId });
    // }
    console.log(vip);
    const nextLevelMap = {
      Bronze: "Silver",
      Silver: "Gold",
      Gold: "Diamond",
      Diamond: "Elite",
      Elite: "Elite",
    };

    const nextLevel = nextLevelMap[vip.currentLevel];

    res.json({
      success: true,
      data: {
        currentLevel: vip.currentLevel,
        vipPoints: vip.vipPoints,
        monthlyTurnover: vip.monthlyTurnover,
        lifetimeTurnover: vip.lifetimeTurnover,
        nextLevel,
        minConversionPoints: 1000,
        conversionRatio: "1000 VP = 1 BDT",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/vip/points-records
 */
exports.getVipPointRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(userId);
    const records = await VipPointTransaction.find({ userId }).sort({
      createdAt: -1,
    });
    console.log(records);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/vip/history
 */
exports.getVipHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(userId);
    const vip = await UserVip.findOne({ userId });
    console.log(vip);
    if (!vip) {
      return res.json({ success: true, data: [] });
    }

    // Example monthly history
    const history = [
      {
        year: new Date().getFullYear(),
        month: new Date().toLocaleString("default", { month: "long" }),
        level: vip.currentLevel,
        experience: vip.monthlyTurnover / 1000,
      },
    ];

    console.log(history);

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/vip/convert-points
 */
// exports.convertVipPoints = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     console.log(req.body);
//     const userId = req.user.userId;
//     const { points } = req.body;
//     console.log("points", points);
//     const user = await User.findOne({ userId});
//     console.log("user", user.userId);
//     const vip = await UserVip.findOne({ userId: user.userId });
//     console.log("vip", vip);
//     if (!vip) {
//       return res
//         .status(404)
//         .json({ success: false, message: "VIP data not found" });
//     }
//     console.log(vip.vipPoints);
//     if (points < 1000) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Minimum 100 VP required" });
//     }
//     console.log(vip.vipPoints);
//     if (vip.vipPoints < points) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Insufficient VP" });
//     }
//     console.log(vip.vipPoints);
//     const realMoney = points / 1000;
//     const claimAmount = realMoney;
//     // await VipPointTransaction.create({
//     //   userId,
//     //   type: "used",
//     //   points,
//     //   source: "conversion",
//     //   balanceAfter: vip.vipPoints,
//     // });
//     await User.updateOne({ userId }, { $inc: { balance: claimAmount }}, { session});
//     console.log("vip.vipPoints", vip.vipPoints , "userId", user.userId);
//     vip.vipPoints = vip.vipPoints - points;
//     console.log("vip.vipPoints", vip.vipPoints);
//     await vip.save({ session });
//     await VipPointTransaction.create([{
//       userId,
//       source: "conversion",
//       type: "used",
//       points,
//       amount,
//       balanceAfter: vip.vipPoints,
//       description: "VIP points converted"
//     }], { session });


//      await session.commitTransaction();
//     console.log(vip.vipPoints);

//     res.json({
//       success: true,
//       data: {
//         convertedPoints: points,
//         amount: realMoney,
//       },
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     res.status(500).json({ success: false, message: err.message });
//   }
//   finally {
//     session.endSession();
//   }
// };
exports.convertVipPoints = async (req, res) => {
  try {
    const amount = await vipService.convertPoints(
      req.user.userId,
      Number(req.body.points)
    );

    res.json({
      success: true,
      data: { amount }
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/**
 * GET /api/vip/conversion-preview
 */
exports.getConversionPreview = async (req, res) => {
  res.json({
    success: true,
    data: {
      ratio: "1000 VP = 1 BDT",
      minPoints: 1000,
    },
  });
};

/**
 * GET /api/vip/level-benefits
 */
exports.getLevelBenefits = async (req, res) => {
  res.json({
    success: true,
    data: {
      Bronze: { cashback: "0.5%", withdrawLimit: "Normal" },
      Silver: { cashback: "1%", withdrawLimit: "Fast" },
      Gold: { cashback: "1.5%", withdrawLimit: "Faster" },
      Diamond: { cashback: "2%", withdrawLimit: "Instant" },
      Elite: { cashback: "3%", withdrawLimit: "VIP Priority" },
    },
  });
};
