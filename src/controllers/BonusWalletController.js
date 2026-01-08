const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/User");
const UserBonus = require("../models/UserBonus");
const BonusWalletTransaction = require("../models/BonusWalletTransaction");
const BonusWallet = require("../models/BonusWallet");
const notificationController = require("../controllers/notificationController");
const { randomBytes } = require("crypto");

// exports.claimBonus = asyncHandler(async function (req, res, next) {
//   const userId = req.user.userId;
//   // const bonusId = req.params.bonusId;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     //   const bonus = await UserBonus.findOne({
//     //     _id: bonusId,
//     //     userId,
//     //     status: 'Active'
//     //   }).session(session);

//     //   if (!bonus) {
//     //     throw new Error('Bonus not found or not available');
//     //   }

//     //   // Check if bonus has expired
//     //   if (bonus.expiresAt && bonus.expiresAt < new Date()) {
//     //     bonus.status = 'EXPIRED';
//     //     await bonus.save({ session });
//     //     throw new Error('Bonus has expired');
//     //   }

//     // Get or create wallet
//     let wallet = await BonusWallet.findOne({ userId }).session(session);
//     if (!wallet) {
//       wallet = new BonusWallet({ userId });
//     }
//     const transactionId = `${randomBytes(16).toString("hex")}_${Date.now()}`;

//     // Get user
//     const user = await User.findOne({ userId }).session(session);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // const transaction = BonusWalletTransaction.create({
//     //   userId,
//     //   walletType: "BONUS",
//     //   type: "CLAIMED",
//     //   transactionId: transactionId, // ✅ REQUIRED
//     //   amount: wallet.amount,
//     //   balanceBefore: wallet.amount,
//     //   balanceAfter: 0,
//     //   remark: "Bonus claimed",
//     // });


//     const transaction = new BonusWalletTransaction({
//       userId,
//       walletType: "BONUS",
//       type: "CLAIMED",
//       transactionId: transactionId,
//       amount: wallet.amount,
//       balanceBefore: wallet.amount,
//       balanceAfter: 0,
//       remark: "Bonus claimed",
//       ref: `bonus_txn_${Date.now()}_${Math.floor(Math.random() * 1000)}` // unique ref
//     });


//     // Update wallet
//     //   wallet.bonusBalance - BonusWallet.amount
//     wallet.balance = 0;
//     wallet.amount = 0;
//     wallet.claimedAt = new Date();

//     wallet.status = "CLAIMED";

//     //   bonus.claimedAt = new Date();
//     //   bonus.claimedAmount = bonus.bonusAmount;
//     // wallet.transactionId = transaction._id;
//     await User.updateOne(
//       { userId: userId },
//       { $inc: { balance: wallet.amount } }
//     ).session(session);
//     // Save all changes
//     //   await bonus.save({ session });
//     await wallet.save({ session });
//     await transaction.save({ session });

//     await session.commitTransaction();

//     await notificationController.createNotification(
//       `${wallet.bonusType} claile ${wallet.status} with (User ID: ${userId}) bonus amount ${wallet.bonusBalance}`,
//       userId,
//       "BONUS_CLAIM"
//     );

//     res.json({
//       success: true,
//       newBalance: wallet.bonusBalance,
//       transactionId: transaction._id,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// });
exports.claimBonus = asyncHandler(async function (req, res) {
  const userId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get or create wallet
    let wallet = await BonusWallet.findOne({ userId }).session(session);
    if (!wallet) {
      wallet = new BonusWallet({ userId, balance: 0, amount: 0, status: 'ACTIVE' });
    }

    if (wallet.amount <= 0) {
      throw new Error('No bonus available to claim');
    }

    // Save claim amount before zeroing wallet
    const claimAmount = wallet.amount;

    // Generate unique transaction ID and ref
    const transactionId = `${randomBytes(16).toString("hex")}_${Date.now()}`;
    const ref = `bonus_txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create transaction
    const transaction = await BonusWalletTransaction.create([{
      userId,
      walletType: "BONUS",
      type: "CLAIMED",
      transactionId,
      amount: claimAmount,
      balanceBefore: wallet.amount,
      balanceAfter: 0,
      remark: "Bonus claimed",
      ref // ✅ unique ref
    }], { session });


              // await UserBonus.create([{
              //   userId: userId,
              //   bonusId: wallet.bonusId,
              //   amount: transaction.amount,
              //   bonusAmount: transaction.amount,
              //   remainingAmount: transaction.amount,
              //   turnoverRequirement: transaction.amount,
              //   expiryDate: transaction.expiryDate,
              //   transactionId: transaction.transactionID,
              //   bonusType: transaction.bonusType
              // }], { session });

    // Update wallet
    wallet.balance = 0;
    wallet.amount = 0;
    wallet.claimedAt = new Date();
    wallet.status = "CLAIMED";
    await wallet.save({ session });

    // Update user balance
    await User.updateOne(
      { userId },
      { $inc: { balance: claimAmount } }
    ).session(session);

    // Commit transaction
    await session.commitTransaction();

    // Notification
    await notificationController.createNotification(
      `BONUS claimed with status ${wallet.status} for User ID: ${userId}, amount: ${claimAmount}`,
      userId,
      "BONUS_CLAIM"
    );

    res.json({
      success: true,
      newBalance: claimAmount,
      transactionId: transaction[0]._id
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});
exports.getBonusWallet = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const wallet = await BonusWallet.findOne({ userId });

    return res.json({
      success: true,
      balance: wallet ? wallet.balance.toFixed(2) : 0,
      amount: wallet ? wallet.amount.toFixed(2) : 0,
    });
  } catch (error) {
    return next(error); // ✅ only forward error
  }
});



exports.getBonusWalletTransaction = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { from, to } = req.query;

  const match = {
    userId,
    walletType: "BONUS"
  };

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  const transactions = await BonusWalletTransaction.find(match)
    .sort({ createdAt: -1 });

  const claimedAmount = transactions
    .filter(t => t.type === "CLAIMED")
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    success: true,
    data: {
      claimed_amount: claimedAmount,
      transactions
    }
  });
});




exports.getBonusSummary = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { from, to } = req.query;
console.log(from, to);
  const match = {
    userId,
    createdAt: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  };

  const transactions = await BonusWalletTransaction.find(match)
    .sort({ createdAt: -1 });

  const summary = await BonusWalletTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);

  let total_claimed = 0;
  let total_rebate = 0;
  let total_expired = 0;

  summary.forEach(s => {
    if (s._id === "CLAIMED") total_claimed = s.total;
    if (s._id === "DEBIT") total_rebate = s.total;
    if (s._id === "EXPIRED") total_expired = s.total;
  });

  res.json({
    success: true,
    data: {
      total_rebate,
      total_claimed,
      total_expired,
      transactions
    }
  });
});



// // Other controller methods...

// const asyncHandler = require('express-async-handler');
// const mongoose = require('mongoose');
// const User = require('../models/User');
// const BonusWallet = require('../models/BonusWallet');
// const UserBonusWallet = require('../models/UserBonusWallet');
// const BonusWalletTransaction = require('../models/BonusWalletTransaction');
// const notificationController = require('./notificationController');
// const { randomBytes } = require('crypto');

// // Grant a new bonus to user
// exports.grantBonus = asyncHandler(async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { userId, bonusType, amount, wageringRequirement, expiresInHours, sourceId, metadata } = req.body;

//         // Validate input
//         if (!userId || !bonusType || !amount || amount <= 0) {
//             throw new Error('Invalid bonus data');
//         }

//         // Check if user exists
//         const user = await User.findOne({ userId }).session(session);
//         if (!user) {
//             throw new Error('User not found');
//         }

//         // Generate unique bonus ID
//         const bonusId = `BONUS_${Date.now()}_${randomBytes(4).toString('hex')}`;

//         // Calculate expiration
//         const expiresAt = expiresInHours
//             ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
//             : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

//         // Create bonus entry
//         const bonus = new BonusWallet({
//             userId,
//             bonusId,
//             bonusType,
//             amount,
//             balance: amount, // Initial balance equals amount
//             wageringRequirement: wageringRequirement || amount * 10, // Default 10x turnover
//             status: 'ACTIVE',
//             locked: wageringRequirement > 0,
//             expiresAt,
//             sourceId,
//             metadata,
//             activatedAt: new Date()
//         });

//         // Get or create user's bonus wallet summary
//         const userBonusWallet = await UserBonusWallet.getOrCreate(userId);
//         userBonusWallet.totalBonusEarned += amount;
//         userBonusWallet.availableBalance += amount;
//         userBonusWallet.activeBonusesCount += 1;

//         // Create transaction record
//         const transaction = new BonusWalletTransaction({
//             userId,
//             bonusId: bonus._id,
//             type: 'CREDIT',
//             amount,
//             balanceBefore: userBonusWallet.availableBalance - amount,
//             balanceAfter: userBonusWallet.availableBalance,
//             ref: `BONUS_${bonusId}`,
//             remark: `Bonus granted: ${bonusType}`,
//             metadata: {
//                 bonusType,
//                 wageringRequirement: bonus.wageringRequirement,
//                 expiresAt: bonus.expiresAt
//             }
//         });

//         // Save all changes
//         await bonus.save({ session });
//         await userBonusWallet.save({ session });
//         await transaction.save({ session });

//         await session.commitTransaction();

//         // Send notification
//         await notificationController.createNotification(
//             `${bonusType} bonus of $${amount} has been granted to your account`,
//             userId,
//             'BONUS_GRANTED'
//         );

//         res.status(201).json({
//             success: true,
//             message: 'Bonus granted successfully',
//             data: {
//                 bonusId: bonus.bonusId,
//                 amount,
//                 expiresAt,
//                 wageringRequirement: bonus.wageringRequirement
//             }
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     } finally {
//         session.endSession();
//     }
// });

// // Claim a specific bonus
// exports.claimBonus = asyncHandler(async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const userId = req.user.userId;
//         const bonusId = req.params.bonusId;

//         // Find the specific bonus
//         const bonus = await BonusWallet.findOne({
//             userId,
//             bonusId,
//             status: 'ACTIVE'
//         }).session(session);

//         if (!bonus) {
//             throw new Error('Bonus not found or not active');
//         }

//         if (bonus.isExpired()) {
//             bonus.status = 'EXPIRED';
//             await bonus.save({ session });
//             throw new Error('Bonus has expired');
//         }

//         if (!bonus.canClaim()) {
//             throw new Error('Bonus cannot be claimed yet. Wagering requirements not met.');
//         }

//         const claimAmount = bonus.balance;

//         // Get user bonus wallet
//         const userBonusWallet = await UserBonusWallet.getOrCreate(userId);
//         const balanceBefore = userBonusWallet.availableBalance;

//         // Update user's main balance
//         await User.findOneAndUpdate(
//             { userId },
//             { $inc: { balance: claimAmount } },
//             { session, new: true }
//         );

//         // Update bonus record
//         bonus.balance = 0;
//         bonus.claimedAmount += claimAmount;
//         bonus.status = 'CLAIMED';
//         bonus.claimedAt = new Date();

//         // Update user bonus wallet
//         userBonusWallet.totalBonusClaimed += claimAmount;
//         userBonusWallet.availableBalance -= claimAmount;
//         userBonusWallet.activeBonusesCount -= 1;
//         userBonusWallet.lastClaimedAt = new Date();

//         // Update statistics
//         const today = new Date().toDateString();
//         const lastClaimDate = userBonusWallet.lastClaimedAt
//             ? userBonusWallet.lastClaimedAt.toDateString()
//             : null;

//         if (lastClaimDate !== today) {
//             userBonusWallet.statistics.todayClaims = 1;
//             userBonusWallet.statistics.todayBonus = claimAmount;
//         } else {
//             userBonusWallet.statistics.todayClaims += 1;
//             userBonusWallet.statistics.todayBonus += claimAmount;
//         }

//         // Create transaction record
//         const transaction = new BonusWalletTransaction({
//             userId,
//             bonusId: bonus._id,
//             type: 'CLAIM',
//             amount: claimAmount,
//             balanceBefore,
//             balanceAfter: userBonusWallet.availableBalance,
//             ref: `CLAIM_${randomBytes(8).toString('hex')}`,
//             remark: `Bonus claimed: ${bonus.bonusType}`,
//             metadata: {
//                 sourceBonusId: bonus.bonusId,
//                 bonusType: bonus.bonusType
//             }
//         });

//         // Save all changes
//         await bonus.save({ session });
//         await userBonusWallet.save({ session });
//         await transaction.save({ session });

//         await session.commitTransaction();

//         // Send notification
//         await notificationController.createNotification(
//             `Successfully claimed $${claimAmount} from ${bonus.bonusType} bonus`,
//             userId,
//             'BONUS_CLAIMED'
//         );

//         res.json({
//             success: true,
//             message: 'Bonus claimed successfully',
//             data: {
//                 claimedAmount: claimAmount,
//                 newBalance: userBonusWallet.availableBalance,
//                 transactionId: transaction._id
//             }
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     } finally {
//         session.endSession();
//     }
// });

// // Get user's bonus wallet summary
// exports.getBonusWallet = asyncHandler(async (req, res) => {
//     try {
//         const userId = req.user.userId;

//         // Get wallet summary
//         const wallet = await UserBonusWallet.getOrCreate(userId);

//         // Get active bonuses
//         const activeBonuses = await BonusWallet.find({
//             userId,
//             status: 'ACTIVE'
//         }).sort({ expiresAt: 1 });

//         // Get recent transactions
//         const recentTransactions = await BonusWalletTransaction.find({
//             userId
//         }).sort({ createdAt: -1 }).limit(10);

//         res.json({
//             success: true,
//             data: {
//                 summary: wallet,
//                 activeBonuses,
//                 recentTransactions
//             }
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// });

// // Update wagering from betting
// exports.updateWageringFromBet = asyncHandler(async (userId, turnover, provider) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         // Find all active bonuses for this user
//         const activeBonuses = await BonusWallet.find({
//             userId,
//             status: 'ACTIVE',
//             locked: true
//         }).session(session);

//         for (const bonus of activeBonuses) {
//             if (bonus.wageringRequirement > 0) {
//                 const newWageringCompleted = bonus.wageringCompleted + turnover;
//                 bonus.wageringCompleted = Math.min(
//                     newWageringCompleted,
//                     bonus.wageringRequirement
//                 );

//                 // Unlock if wagering met
//                 if (bonus.wageringCompleted >= bonus.wageringRequirement) {
//                     bonus.locked = false;
//                     bonus.provider = provider;
//                 }

//                 await bonus.save({ session });
//             }
//         }

//         await session.commitTransaction();
//         return true;

//     } catch (error) {
//         await session.abortTransaction();
//         console.error('Error updating wagering:', error);
//         return false;
//     } finally {
//         session.endSession();
//     }
// });
