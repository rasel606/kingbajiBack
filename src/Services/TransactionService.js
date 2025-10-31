// // Services/TransactionService.js
// const TransactionModel = require('../Models/TransactionModel');
// const SubAdmin = require('../Models/SubAdminModel');

// class TransactionControllerService {
//   // Search deposit transactions
//   static async searchDepositTransactions(req, res) {
//     try {
//       const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
      
//       // Find the sub-admin by referral code
//       const subAdminUser = await SubAdmin.findOne({ referralCode: referredBy });
//       if (!subAdminUser) {
//         return res.status(404).json({ message: 'Sub-admin not found' });
//       }

//       // Build query
//       let query = { referredBy: subAdminUser.referralCode, type: 0 };

//       if (userId) {
//         query.userId = userId;
//       }
//       if (amount) {
//         query.amount = { $gte: parseFloat(amount) };
//       }
//       if (gateway_name) {
//         query.gateway_name = gateway_name;
//       }
//       if (status !== undefined && !isNaN(status) && status !== "") {
//         query.status = parseInt(status);
//       }
//       if (startDate && endDate) {
//         query.datetime = {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         };
//       } else if (startDate) {
//         query.datetime = { $gte: new Date(startDate) };
//       } else if (endDate) {
//         query.datetime = { $lte: new Date(endDate) };
//       }

//       // Execute query
//       const transactions = await TransactionModel.find(query).sort({ datetime: -1 });

//       // Calculate total
//       const totalResult = await TransactionModel.aggregate([
//         { $match: query },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);

//       const total = totalResult.length > 0 ? totalResult[0].total : 0;

//       res.json({ 
//         success: true, 
//         transactions, 
//         total: { total } 
//       });
//     } catch (error) {
//       console.error("Error searching transactions:", error);
//       res.status(500).json({ 
//         success: false, 
//         message: "Server error" 
//       });
//     }
//   }

//   // Update deposit status
//   static async updateDepositStatus(req, res) {
//     try {
//       const { transactionId } = req.params;
//       const { status, userId } = req.body;

//       // Find and update transaction
//       const transaction = await TransactionModel.findOneAndUpdate(
//         { transactionID: transactionId, userId },
//         { status: parseInt(status) },
//         { new: true }
//       );

//       if (!transaction) {
//         return res.status(404).json({ message: 'Transaction not found' });
//       }

//       res.json({
//         success: true,
//         message: `Deposit ${transactionId} updated to ${status === 1 ? "Approved" : "Rejected"}`,
//         transaction
//       });
//     } catch (error) {
//       console.error("Error updating transaction:", error);
//       res.status(500).json({ 
//         success: false, 
//         message: "Server error" 
//       });
//     }
//   }

//   // Get deposit totals
//   static async getDepositTotals(req, res) {
//     try {
//       const { referredBy } = req.params;

//       // Validate referral code
//       const subAdminUser = await SubAdmin.findOne({ referralCode: referredBy });
//       if (!subAdminUser) {
//         return res.status(404).json({ message: 'Sub-admin not found' });
//       }

//       // Calculate totals for different time periods
//       const now = new Date();
//       const lastDay = new Date(now.getTime() - (24 * 60 * 60 * 1000));
//       const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
//       const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

//       const totals = await Promise.all([
//         // Last day
//         TransactionModel.aggregate([
//           { 
//             $match: { 
//               referredBy: referredBy, 
//               type: 0, 
//               datetime: { $gte: lastDay } 
//             } 
//           },
//           { $group: { _id: null, total: { $sum: "$amount" } } }
//         ]),
//         // Last 7 days
//         TransactionModel.aggregate([
//           { 
//             $match: { 
//               referredBy: referredBy, 
//               type: 0, 
//               datetime: { $gte: last7Days } 
//             } 
//           },
//           { $group: { _id: null, total: { $sum: "$amount" } } }
//         ]),
//         // Last 30 days
//         TransactionModel.aggregate([
//           { 
//             $match: { 
//               referredBy: referredBy, 
//               type: 0, 
//               datetime: { $gte: last30Days } 
//             } 
//           },
//           { $group: { _id: null, total: { $sum: "$amount" } } }
//         ]),
//         // All time
//         TransactionModel.aggregate([
//           { 
//             $match: { 
//               referredBy: referredBy, 
//               type: 0 
//             } 
//           },
//           { $group: { _id: null, total: { $sum: "$amount" } } }
//         ])
//       ]);

//       res.json({
//         success: true,
//         data: {
//           lastDay: totals[0].length > 0 ? totals[0][0].total : 0,
//           last7Days: totals[1].length > 0 ? totals[1][0].total : 0,
//           last30Days: totals[2].length > 0 ? totals[2][0].total : 0,
//           allTime: totals[3].length > 0 ? totals[3][0].total : 0
//         }
//       });
//     } catch (error) {
//       console.error("Error getting deposit totals:", error);
//       res.status(500).json({ 
//         success: false, 
//         message: "Server error" 
//       });
//     }
//   }
// }

// module.exports = TransactionControllerService;











// const TransactionModel = require("../Models/TransactionModel");
// const User = require("../Models/User");
// const Bonus = require("../Models/Bonus");
// const UserBonus = require("../Models/UserBonus");
// const notificationController = require("../Controllers/notificationController");
// const { getUserWithReferralLevels, getReferralOwner } = require("./getReferralOwnerService");

// // ✅ Process Transaction (Deposit / Withdraw / Reject)
// const processTransaction = async ({ userId, action, transactionID, referralUser }) => {
//   const user = await getUserWithReferralLevels(userId);
//   if (!user || user.referredBy !== referralUser.referralCode)
//     throw new Error("User not found or referral mismatch");

//   const referralData = await getReferralOwner(referralUser.referralCode);
//   if (!referralData) throw new Error("Invalid referral owner");

//   const paymentOwner =
//     referralData.role === "affiliate" ? referralData.subAdmin : referralData.owner;
//   if (!paymentOwner) throw new Error("Payment owner not found");

//   let transaction = await TransactionModel.findOne({ transactionID, status: 0 });
//   if (!transaction) throw new Error("Transaction not found or already processed");

//   const baseAmount = parseFloat(transaction.amount);
//   const type = transaction.type;
//   if (isNaN(baseAmount) || baseAmount <= 0) throw new Error("Invalid amount");

//   // ✅ Reject
//   if (action === "reject") {
//     transaction = await TransactionModel.findOneAndUpdate(
//       { transactionID },
//       { status: 2 },
//       { new: true }
//     );
//     await notificationController.createNotification(
//       `Transaction Rejected (${transactionID})`,
//       user.userId,
//       `Your ${parseInt(type) === 0 ? "deposit" : "withdrawal"} of ${baseAmount} was rejected.`,
//       "rejected",
//       { amount: baseAmount, transactionID }
//     );
//     return { status: 2, transaction };
//   }

//   // ✅ Deposit
//   if (parseInt(type) === 0) {
//     let bonusAmount = 0,
//       bonusId = null,
//       turnoverRequirement = 0;

//     const depositBonus = await Bonus.findOne({
//       bonusType: "deposit",
//       isActive: true,
//       _id: transaction.bonusId,
//       minDeposit: { $lte: baseAmount },
//     }).sort({ minDeposit: -1 });

//     if (transaction.bonusId && depositBonus) {
//       bonusAmount =
//         depositBonus.fixedAmount ||
//         Math.floor((baseAmount * depositBonus.percentage) / 100);
//       if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus)
//         bonusAmount = depositBonus.maxBonus;

//       bonusId = depositBonus._id;
//       turnoverRequirement =
//         (baseAmount + bonusAmount) * depositBonus.wageringRequirement;
//     }

//     if (paymentOwner.balance < baseAmount)
//       throw new Error("SubAdmin/Owner balance insufficient");

//     paymentOwner.balance -= baseAmount;
//     user.balance += baseAmount;

//     transaction = await TransactionModel.findOneAndUpdate(
//       { transactionID },
//       {
//         status: 1,
//         bonus_amount: bonusAmount,
//         amount: baseAmount + bonusAmount,
//         bonusId,
//         isBonusApplied: bonusAmount > 0,
//         bonusStatus: bonusAmount > 0 ? "active" : undefined,
//         turnoverRequirement,
//         expiryDate: bonusAmount > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
//       },
//       { new: true }
//     );

//     if (bonusAmount > 0) {
//       await UserBonus.create({
//         userId: user.userId,
//         bonusId,
//         amount: baseAmount,
//         bonusAmount,
//         remainingAmount: bonusAmount,
//         turnoverRequirement,
//         expiryDate: transaction.expiryDate,
//         transactionId: transactionID,
//       });
//     }

//     await paymentOwner.save();
//     await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });

//     await notificationController.createNotification(
//       `Deposit Approved (${transactionID})`,
//       user.userId,
//       `Deposit of ${transaction.amount} has been approved.`,
//       "approved",
//       { amount: transaction.amount, transactionID }
//     );

//     return { status: 1, transaction };
//   }

//   // ✅ Withdraw
//   if (parseInt(type) === 1) {
//     if (user.balance < baseAmount) throw new Error("User balance insufficient");

//     user.balance -= baseAmount;
//     paymentOwner.balance += baseAmount;

//     transaction = await TransactionModel.findOneAndUpdate(
//       { transactionID },
//       { status: 1 },
//       { new: true }
//     );

//     await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });
//     await paymentOwner.save();

//     await notificationController.createNotification(
//       `Withdrawal Approved (${transactionID})`,
//       user.userId,
//       `Withdrawal of ${transaction.amount} has been approved.`,
//       "approved",
//       { amount: transaction.amount, transactionID }
//     );

//     return { status: 1, transaction };
//   }

//   throw new Error("Invalid transaction type");
// };

// module.exports = { processTransaction };






const TransactionModel = require("../Models/TransactionModel");
const User = require("../Models/User");
const Bonus = require("../Models/Bonus");
const UserBonus = require("../Models/UserBonus");
const notificationController = require("../Controllers/notificationController");
const { getUserWithReferralLevels, getReferralOwner } = require("./getReferralOwner");

// ✅ Process Transaction (Deposit / Withdraw / Reject) with Affiliate bonus deduction
const processTransaction = async ({ userId, action, transactionID, referralUser }) => {
  console.log("processTransaction", userId, action, transactionID, referralUser);
  // 1️⃣ User & Referral Validation
  const user = await getUserWithReferralLevels(userId);
  console.log("processTransaction user", user);
  if (!user || user.referredBy !== referralUser.referralCode)
    throw new Error("User not found or referral mismatch");

  const referralData = await getReferralOwner(referralUser.referralCode);
  console.log("processTransaction referralData", referralData);
  if (!referralData) throw new Error("Invalid referral owner");

  const paymentOwner =
    referralData.role === "affiliate" ? referralData.subAdmin : referralData.owner;
  if (!paymentOwner) throw new Error("Payment owner not found");

  // 2️⃣ Find Transaction
  let transaction = await TransactionModel.findOne({ transactionID, status: 0 });
  if (!transaction) throw new Error("Transaction not found or already processed");

  const baseAmount = parseFloat(transaction.amount);
  const type = transaction.type;
  if (isNaN(baseAmount) || baseAmount <= 0) throw new Error("Invalid amount");

  // ✅ Reject Transaction
  if (action === "reject") {
    transaction = await TransactionModel.findOneAndUpdate(
      { transactionID },
      { status: 2 },
      { new: true }
    );
    await notificationController.createNotification(
      `Transaction Rejected (${transactionID})`,
      user.userId,
      `Your ${parseInt(type) === 0 ? "deposit" : "withdrawal"} of ${baseAmount} was rejected.`,
      "rejected",
      { amount: baseAmount, transactionID }
    );
    return { status: 2, transaction };
  }

  // ✅ Deposit Transaction
  if (parseInt(type) === 0) {
    let bonusAmount = 0,
      bonusId = null,
      turnoverRequirement = 0;

    const depositBonus = await Bonus.findOne({
      bonusType: "deposit",
      isActive: true,
      _id: transaction.bonusId,
      minDeposit: { $lte: baseAmount },
    }).sort({ minDeposit: -1 });

    if (transaction.bonusId && depositBonus) {
      bonusAmount =
        depositBonus.fixedAmount ||
        Math.floor((baseAmount * depositBonus.percentage) / 100);
      if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus)
        bonusAmount = depositBonus.maxBonus;

      bonusId = depositBonus._id;
      turnoverRequirement =
        (baseAmount + bonusAmount) * depositBonus.wageringRequirement;

      // ✅ Deduct bonus from Affiliate if applicable
      if (referralData.role === "affiliate" && referralData.owner) {
        if (referralData.owner.balance < bonusAmount)
          throw new Error("Affiliate balance insufficient for bonus");
        referralData.owner.balance -= bonusAmount;
        await referralData.owner.save();
      }
    }

    // ✅ Check SubAdmin/Owner balance for deposit
    if (paymentOwner.balance < baseAmount)
      throw new Error("SubAdmin/Owner balance insufficient");

    paymentOwner.balance -= baseAmount;
    user.balance += baseAmount;

    transaction = await TransactionModel.findOneAndUpdate(
      { transactionID },
      {
        status: 1,
        bonus_amount: bonusAmount,
        amount: baseAmount + bonusAmount,
        bonusId,
        isBonusApplied: bonusAmount > 0,
        bonusStatus: bonusAmount > 0 ? "active" : undefined,
        turnoverRequirement,
        expiryDate: bonusAmount > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      },
      { new: true }
    );

    // ✅ Create UserBonus record if bonus applied
    if (bonusAmount > 0) {
      await UserBonus.create({
        userId: user.userId,
        bonusId,
        amount: baseAmount,
        bonusAmount,
        remainingAmount: bonusAmount,
        turnoverRequirement,
        expiryDate: transaction.expiryDate,
        transactionId: transactionID,
      });
    }

    await paymentOwner.save();
    await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });

    await notificationController.createNotification(
      `Deposit Approved (${transactionID})`,
      user.userId,
      `Deposit of ${transaction.amount} has been approved.`,
      "approved",
      { amount: transaction.amount, transactionID }
    );

    return { status: 1, transaction };
  }

  // ✅ Withdraw Transaction
  if (parseInt(type) === 1) {
    if (user.balance < baseAmount) throw new Error("User balance insufficient");

    user.balance -= baseAmount;
    paymentOwner.balance += baseAmount;

    transaction = await TransactionModel.findOneAndUpdate(
      { transactionID },
      { status: 1 },
      { new: true }
    );

    await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });
    await paymentOwner.save();

    await notificationController.createNotification(
      `Withdrawal Approved (${transactionID})`,
      user.userId,
      `Withdrawal of ${transaction.amount} has been approved.`,
      "approved",
      { amount: transaction.amount, transactionID }
    );

    return { status: 1, transaction };
  }

  throw new Error("Invalid transaction type");
};

module.exports = { processTransaction };
