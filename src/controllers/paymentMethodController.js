// controllers/paymentMethodController.js

const { getPaymentMethodsForUser } = require("../utils/getPaymentMethods");

const PaymentGateWayTable = require("../models/PaymentGateWayTable");
const User = require("../models/User");

const moment = require("moment");

const TransactionModel = require("../models/TransactionModel");
const notificationController = require("./notificationController");
const PaymentService = require("../services/paymentService");
const {
  getUserWithReferralLevels,
  getReferralOwner,
} = require("../services/getReferralOwner");
const Bonus = require("../models/Bonus");
const AffiliateModel = require("../models/AffiliateModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.GetUserPayMethods = async (req, res) => {
  try {
    const reqUser = req.user;
    console.log("Received userId:", reqUser);

    const user = await User.findOne({ userId: reqUser.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ================================================================
    // 1️⃣ User’s own payment methods
    // ================================================================
    const userOwnGateways = await PaymentGateWayTable.find({
      referredBy: user.referralCode,
      is_active: true,
    });

    // ================================================================
    // 2️⃣ Get referral chain (LEVEL 1,2,3)
    // ================================================================
    const referralData = await getUserWithReferralLevels(user.userId);
    console.log("referralData", referralData);
    if (!referralData) {
      return res.json({
        success: true,
        userOwnGateways: [],
        ownerGateways: [],
      });
    }

    // → Build owner list: parent + parent’s parent + parent’s parent (LEVEL 1,2,3)
    //     const gatewayOwnersList = [
    //       ...referralData.levelOneReferrals,
    //       ...referralData.levelTwoReferrals,
    //       ...referralData.levelThreeReferrals
    //     ];

    //     // Only keep referralCode list

    //     const referredByList = referralData.map(o => o.referralCode);
    // console.log("referredByList", referredByList);
    const gatewayOwnerNew = await getReferralOwner(referralData.referredBy);
    console.log("gatewayOwner", gatewayOwnerNew);
    console.log("gatewayOwner", gatewayOwnerNew);
    // ================================================================
    // 3️⃣ Fetch owner gateways (Time based)
    // ================================================================
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const ownerGateways = await PaymentGateWayTable.find({
      referredBy: gatewayOwnerNew?.referralCode || null || undefined || "1", // root admin referral code
    });

    console.log("ownerGateways", ownerGateways);

    // ================================================================
    // 4️⃣ Attach owner info to each gateway
    // ================================================================
    const ownerGatewaysWithInfo = ownerGateways.map((method) => {
      // const owner = gatewayOwnersList.find(
      //     o => o.referralCode === method.referredBy
      // );

      const owner = gatewayOwnerNew;
      return {
        ...method.toObject(),
        ownerName: owner?.name || "Unknown",
        // ownerId: owner?._id,
        ownerReferralCode: owner?.referralCode,
      };
    });
    console.log("ownerGatewaysWithInfo", ownerGatewaysWithInfo);
    // ================================================================
    // 5️⃣ Response
    // ================================================================
    return res.json({
      success: true,
      userOwnGateways,
      ownerGateways: ownerGatewaysWithInfo,
    });
  } catch (err) {
    console.log("GetUserPayMethods ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.GetDirectDownlineTransactions = async (
  parentModel,
  childModel,
  subChildModel,
  transactionModel,
  user,
  query
) => {
  try {
    console.log("user", user.role, user.referralCode);

    let referredByFilter;
    if (user.role === "Admin") {
      referredByFilter = {
        $or: [
          { referredBy: "1" }, // root admin referral code
          { referredBy: null },
          { referredBy: undefined },
        ],
      };
    } else {
      referredByFilter = { referredBy: user.referralCode };
    }

    // Find parent
    const parent = await parentModel.findOne(referredByFilter);
    console.log("parent", parent);
    if (!parent) return { success: false, message: "Parent not found" };
    let referredByFilterNew;
    if (parent.role === "Admin") {
      referredByFilterNew = "1" || null || undefined;
    } else {
      referredByFilterNew = parent.referralCode;
    }
    // STEP 01: Get Child list (Ex: SubAgent)

    const children = await buildDownlineTree(childModel, referredByFilterNew);
    let allUserIds = [];

    for (const child of children) {
      const directUsers = await subChildModel.find({
        referredBy: child.referralCode,
      });
      directUsers.forEach((u) => allUserIds.push(u.userId));
    }
    console.log("allUserIds", allUserIds);
    if (query.userId) {
      // যদি কুইরিতে userId থাকে, তাহলে শুধু ঐ userId এর ট্রানজেকশন দেখাবে
      allUserIds = allUserIds.filter((id) => id === query.userId);
    }

    // ==============================
    // STEP 02: Fetch Transactions
    // ==============================
    const filter = { userId: { $in: allUserIds } };

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const skip = (page - 1) * limit;
    console.log("filter", filter);
    const transactions = await transactionModel
      .find(filter)
      .sort({ createdAt: -1 }) // নতুন থেকে পুরানো
      .skip(skip)
      .limit(limit);
    console.log("transactions", transactions);
    const total = await transactionModel.countDocuments(filter);

    return {
      success: true,
      page,
      limit,
      total,
      transactions,
    };
  } catch (error) {
    console.error("GetDirectDownlineTransactions Error", error);
    return { success: false, message: "Server error" };
  }
};

const buildDownlineTree = async (model, referralCode) => {
  const downline = await model.find({ referredBy: referralCode });

  const result = [];

  for (const node of downline) {
    const children = await buildDownlineTree(model, node.referralCode);

    result.push({
      _id: node._id,
      userId: node.userId,
      name: node.name,
      email: node.email,
      phone: node.phone,
      referralCode: node.referralCode,
      referredBy: node.referredBy,
      balance: node.balance,
      role: node.role,
      createdAt: node.createdAt,
      children,
    });
  }

  return result;
};

// exports.GetParentAndDownlineTransactions = async (ParentUserModel, childModel, subChildModel,childUserModel, transactionModel, user, query) => {
//     try {
//         console.log("user", user.userId, user.role, user.referralCode);
//         const parent = await ParentUserModel.findOne({ referredBy: user.referralCode });
//         if (!parent) return { success: false, message: "Parent not found" };

//         // STEP 2: Get children (direct downline)
//         const children = await buildDownlineTree(childModel, parent.referralCode);
//         const childUserIds = children.map(c => c.userId);
//         const childUserNew = await childUserModel.find({ referredBy:  parent.referralCode });
//         const childUserIdsNew = children.map(c => c.userId);
//         console.log("childUserNew", childUserNew);
//         // STEP 3: Get sub-children
//         const subChildren = await subChildModel.find({ referredBy: { $in: children.map(c => c.referralCode) } });
//         const subChildUserIds = subChildren.map(u => u.userId);

//         console.log("childUserIds", subChildren, subChildUserIds);
//         // Combine all userIds including parent
//         let allUserIds = [...childUserIds, ...subChildUserIds,...childUserIdsNew];

//         // Filter by query.userId if present
//         if (query.userId) {
//             allUserIds = allUserIds.filter(id => id.toString() === query.userId.toString());
//         }

//         // STEP 4: Fetch transactions
//         const filter = { userId: { $in: allUserIds } };
//         if (query.status !== undefined) filter.status = parseInt(query.status);
//         if (query.type) filter.type = query.type;

//         const limit = parseInt(query.limit) || 10;
//         const page = parseInt(query.page) || 1;
//         const skip = (page - 1) * limit;

//         const [transactions, total] = await Promise.all([
//             transactionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
//             transactionModel.countDocuments(filter)
//         ]);

//         return { success: true, page, limit, total, transactions };

//     } catch (error) {
//         console.error("GetParentAndDownlineTransactions Error", error);
//         return { success: false, message: "Server error" };
//     }
// };

exports.GetParentAndDownlineTransactions = async (
  ParentUserModel,
  childModel,
  subChildModel,
  childUserModel,
  transactionModel,
  user,
  query
) => {
  try {
    console.log("user", query);

    // STEP 1: Get parent
    const parent = await ParentUserModel.findOne({
      referredBy: user.referralCode,
    });
    if (!parent) return { success: false, message: "Parent not found" };

    // STEP 2: Get children (direct downline)
    const children = await buildDownlineTree(childModel, parent.referralCode);
    const childUserIds = children.map((c) => c.userId);

    // Optional additional childUserModel fetch
    const childUserNew = await childUserModel.find({
      referredBy: parent.referralCode,
    });
    const childUserIdsNew = childUserNew.map((c) => c.userId);

    // STEP 3: Get sub-children
    const subChildren = await subChildModel.find({
      referredBy: { $in: children.map((c) => c.referralCode) },
    });
    const subChildUserIds = subChildren.map((u) => u.userId);

    // STEP 4: Combine all userIds (avoid duplicates)
    let allUserIds = Array.from(
      new Set([
        parent.userId,
        ...childUserIds,
        ...childUserIdsNew,
        ...subChildUserIds,
      ])
    );

    // Filter by specific userId if provided
    if (query.userId) {
      allUserIds = allUserIds.filter(
        (id) => id.toString() === query.userId.toString()
      );
    }

    // STEP 5: Build transaction filter                                                                                 
    const filter = { userId: { $in: allUserIds } }
    if (query.status !== undefined) filter.status = parseInt(query.status);
    if (query.type !== undefined) filter.type = query.type;

    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const skip = (page - 1) * limit;
    // STEP 6: Fetch transactions
    const [transactions, total] = await Promise.all([
      transactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      transactionModel.countDocuments(filter),
    ]);

    return { success: true, page, limit, total, transactions };
  } catch (error) {
    console.error("GetParentAndDownlineTransactions Error:", error);
    return { success: false, message: "Server error" };
  }
};

// exports.Approve_Transfar_With_Deposit_And_Widthraw_By_SubAdmin = async (req, res) => {
//     try {
//         const { userId, referralCode, email, mobile, amount, type } = req.body;

//         const transactionType = parseInt(type);
//         const baseAmountInt = parseInt(amount);

//         if (!userId || !referralCode || !email || !mobile || isNaN(baseAmountInt) || isNaN(transactionType)) {
//             return res.status(400).json({ message: 'Missing or invalid required fields' });
//         }

//         const user = await User.findOne({ userId, referredBy: referralCode });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found or referral code mismatch' });
//         }

//         if (!user.phone || String(user.phone[0].number) !== String(mobile)) {
//             return res.status(400).json({ message: 'User phone number mismatch' });
//         }

//         const subAdmin = await SubAdmin.findOne({ email });
//         if (!subAdmin) {
//             return res.status(404).json({ message: 'Sub-admin not found' });
//         }

//         if (subAdmin.referralCode !== referralCode) {
//             return res.status(400).json({ message: 'Referral code mismatch with sub-admin' });
//         }

//         if (baseAmountInt <= 0) {
//             return res.status(400).json({ message: 'Amount must be greater than 0' });
//         }

//         const transactionID = generateReferralCode();

//         const isValidTransaction =
//             user.referredBy === subAdmin.referralCode &&
//             user.userId === userId &&
//             baseAmountInt > 0;

//         // ✅ Withdrawal
//         if (isValidTransaction && transactionType === 1) {
//             if (user.balance < baseAmountInt) {
//                 return res.status(400).json({ message: 'User does not have sufficient balance for withdrawal' });
//             }

//             const newTransaction = new Transaction({
//                 userId: user.userId,
//                 transactionID,
//                 base_amount: baseAmountInt,
//                 amount: baseAmountInt,
//                 gateway_name: "transfer",
//                 payment_type: "transfer",
//                 mobile,
//                 type: 1,
//                 status: 1,
//                 referredBy: referralCode,
//                 is_commission: false,
//                 referredbysubAdmin: subAdmin._id
//             });

//             user.balance -= baseAmountInt;
//             subAdmin.balance += baseAmountInt;

//             await newTransaction.save();
//             await user.save();
//             await subAdmin.save();

//             return res.status(200).json({
//                 message: "Withdrawal transaction completed successfully",
//                 userBalance: user.balance,
//                 subAdminBalance: subAdmin.balance
//             });
//         }

//         // ✅ Deposit
//         else if (isValidTransaction && transactionType === 0) {
//             if (subAdmin.balance < baseAmountInt) {
//                 return res.status(400).json({ message: 'Sub-admin does not have sufficient balance for deposit' });
//             }

//             const bonus = Math.floor((baseAmountInt * 4) / 100); // 4% bonus
//             const totalAmount = baseAmountInt + bonus;

//             const newTransaction = new Transaction({
//                 userId: user.userId,
//                 transactionID,
//                 base_amount: baseAmountInt,
//                 bonus_amount: bonus,
//                 amount: totalAmount,
//                 gateway_name: "transfer",
//                 payment_type: "transfer",
//                 mobile,
//                 type: 0,
//                 status: 1,
//                 referredBy: referralCode,
//                 is_commission: false,
//                 referredbysubAdmin: subAdmin._id
//             });

//             user.balance += baseAmountInt;
//             subAdmin.balance -= baseAmountInt;

//             await newTransaction.save();
//             await user.save();
//             await subAdmin.save();

//             return res.status(200).json({
//                 message: "Deposit transaction completed successfully with bonus",
//                 userBalance: user.balance,
//                 subAdminBalance: subAdmin.balance
//             });
//         }

//         return res.status(400).json({ message: 'Invalid transaction type or conditions not met' });

//     } catch (error) {
//         console.error('Transaction Error:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

exports.approveDeposit = catchAsync(async (req, res, next) => {
  const { userId, referralCode, status } = req.body;
  const { transactionID } = req.params;

  // Find user
  const user = await User.findOne({ userId, referredBy: referralCode });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get payment gateway owner
  const paymentGatewayOwner = await getReferralOwner(referralCode);

  // Find transaction
  const transaction = await TransactionModel.findOne({
    userId,
    transactionID,
    referredBy: paymentGatewayOwner.referralCode,
    type: 0,
  });

  if (!transaction) {
    return next(new AppError("Transaction not found", 404));
  }

  if (transaction.status !== 0) {
    return next(new AppError("Transaction already processed", 400));
  }

  if (parseInt(status) === 1) {
    // APPROVE TRANSACTION

    // Check if payment gateway owner has sufficient balance
    if (paymentGatewayOwner.balance < transaction.amount) {
      return next(new AppError("Insufficient balance", 400));
    }

    // Check if user is referred by affiliate and has bonus
    const isReferredByAffiliate = await Affiliate.findOne({
      referralCode: user.referredBy,
    });

    // Normal transaction without affiliate bonus cut
    paymentGatewayOwner.balance -= transaction.amount;
    user.balance += transaction.amount;

    // Update transaction status
    transaction.status = 1;
    transaction.updatetime = new Date();
    transaction.bonusStatus = "active";

    // Handle bonus creation if applied
    if (transaction.isBonusApplied) {
      const bonus = await Bonus.findById(transaction.bonusId);
      if (bonus) {
        await UserBonus.create({
          userId: user.userId,
          bonusId: transaction.bonusId,
          amount: transaction.amount,
          bonusAmount: transaction.bonus_amount,
          remainingAmount: transaction.bonus_amount,
          turnoverRequirement: transaction.turnoverRequirement,
          expiryDate: transaction.expiryDate,
          transactionId: transaction.transactionID,
        });

        // Update user bonus info
        user.bonus = {
          active: true,
          bonusAmount: transaction.bonus_amount,
          wageringRequirement: transaction.turnoverRequirement,
          completedTurnover: 0,
        };
      }
    }

    // Save all changes
    await paymentGatewayOwner.save();
    await user.save();
    await transaction.save();

    // Send notification to user
    await notificationController.createNotification(
      "Deposit Approved",
      user.userId,
      `Your deposit of ${transaction.amount} has been approved`,
      "deposit_approved",
      { amount: transaction.amount, transactionID: transaction.transactionID }
    );

    // Send notification to affiliate if bonus cut was applied

    res.status(200).json({
      success: true,
      message: "Deposit approved successfully",
      transaction,
      affiliateBonusCut: affiliateBonusCut || undefined,
    });
  } else if (parseInt(status) === 2) {
    // REJECT TRANSACTION

    transaction.status = 2;
    transaction.updatetime = new Date();
    await transaction.save();

    // Send rejection notification
    await notificationController.createNotification(
      "Deposit Rejected",
      user.userId,
      `Your deposit of ${transaction.amount} has been rejected`,
      "deposit_rejected",
      { amount: transaction.amount, transactionID: transaction.transactionID }
    );

    res.status(200).json({
      success: true,
      message: "Deposit rejected successfully",
      transaction,
    });
  } else {
    return next(
      new AppError(
        "Invalid status value. Use 1 for approve or 2 for reject.",
        400
      )
    );
  }
});

exports.submitTransaction = catchAsync(async (req, res, next) => {
  const {
    userId,
    gateway_name,
    base_amount,
    referredBy,
    payment_type,
    gateway_Number,
    transactionID,
    bonusCode,
  } = req.body;

  // Validation
  if (
    !userId ||
    !base_amount ||
    !referredBy ||
    !payment_type ||
    !transactionID ||
    !gateway_name ||
    !gateway_Number
  ) {
    return next(new AppError("All fields are required.", 400));
  }

  const baseAmount = parseFloat(base_amount);
  if (isNaN(baseAmount) || baseAmount <= 0) {
    return next(new AppError("Invalid base amount", 400));
  }

  // Find user
  const user = await User.findOne({ userId: userId });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const existingTransaction = await TransactionModel.findOne({
    userId,
    referredBy: user.referredBy,
    transactionID,
    payment_type,
  });

  if (existingTransaction) {
    return next(new AppError("Transaction already used", 409));
  }

  let bonusAmount = 0;
  let bonusId = null;
  let turnoverRequirement = 0;

  console.log("submitTransaction bonusCode", bonusCode);
  console.log("submitTransaction user.referredBy", user.referredBy);
  console.log("submitTransaction transactionID", transactionID);
  console.log("submitTransaction payment_type", payment_type);
  console.log("submitTransaction gateway_name", gateway_name);
  console.log("submitTransaction gateway_Number", gateway_Number);
  console.log("submitTransaction baseAmount", baseAmount);
  // Process bonus if applicable
  if (baseAmount >= 200 && bonusCode) {
    const depositBonus = await Bonus.findOne({
      // bonusType: 'deposit',
      isActive: true,
      minDeposit: { $lte: baseAmount },
      _id: bonusCode,
    });
    console.log("submitTransaction depositBonus", depositBonus);
    if (depositBonus) {
      bonusAmount =
        depositBonus.fixedAmount ||
        Math.floor((baseAmount * depositBonus.percentage) / 100);

      if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus) {
        bonusAmount = depositBonus.maxBonus;
      }

      bonusId = depositBonus._id;
      turnoverRequirement =
        (baseAmount + bonusAmount) * depositBonus.wageringRequirement;
    }
  }
  console.log("submitTransaction bonusAmount", bonusAmount);
  console.log("submitTransaction bonusId", bonusId);
  // Create transaction
  const newTransaction = await TransactionModel.create({
    userId: user.userId,
    transactionID,
    base_amount: baseAmount,
    bonus_amount: bonusAmount,
    amount: baseAmount + bonusAmount,
    gateway_name,
    gateway_Number,
    payment_type,
    mobile: user.phone[0]?.number || "",
    type: 0,
    status: 0,
    referredBy: user.referredBy,
    bonusId,
    isBonusApplied: bonusAmount > 0,
    bonusStatus: bonusAmount > 0 ? "pending" : undefined,
    turnoverRequirement,
    expiryDate:
      bonusAmount > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
  });

  await notificationController.createNotification(
    `Deposit Request by ${user.name}`,
    user.userId,
    `Deposit of ${newTransaction.amount} submitted via ${gateway_name}`,
    "deposit_request",
    { amount: newTransaction.amount, transactionID }
  );

  res.status(200).json({
    success: true,
    message: "Transaction submitted successfully",
    transaction: newTransaction,
    bonusApplied: bonusAmount > 0,
    bonusAmount,
  });
});

const formatTransactionsForFrontend = (transactions) => {
  // Create an object to group by date
  const groupedByDate = {};

  transactions.forEach((txn) => {
    const dateKey = moment(txn.datetime).format("DD/MM/YYYY");

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }

    groupedByDate[dateKey].push(txn);
  });

  // Convert to array format
  return Object.keys(groupedByDate)
    .sort((a, b) => {
      // Sort dates in descending order (newest first)
      const dateA = moment(a, "DD/MM/YYYY");
      const dateB = moment(b, "DD/MM/YYYY");
      return dateB - dateA;
    })
    .map((date) => ({
      date,
      transactions: groupedByDate[date].map(formatSingleTransaction),
    }));
};

const formatSingleTransaction = (transaction) => {
  const statusMap = {
    0: { text: "Processing", class: "pending" },
    1: { text: "Approved", class: "positive" },
    2: { text: "Rejected", class: "negative" },
    3: { text: "Cancelled", class: "negative" },
  };

  const typeMap = {
    0: "Deposit",
    1: "Withdrawal",
    2: "Adjustment",
    3: "Bonus",
  };

  return {
    _id: transaction._id,
    transactionID: transaction.transactionID,
    type: transaction.type,
    typeText: typeMap[transaction.type] || "Unknown",
    base_amount: transaction.base_amount.toFixed(2),
    bonus_amount: transaction.bonus_amount?.toFixed(2) || "0.00",
    amount:
      transaction.amount?.toFixed(2) || transaction.base_amount.toFixed(2),
    mobile: transaction.mobile,
    gateway_name: transaction.gateway_name,
    status: transaction.status,
    statusInfo: statusMap[transaction.status] || { text: "Unknown", class: "" },
    details: transaction.details,
    payment_type: transaction.payment_type,
    isBonusApplied: transaction.isBonusApplied,
    bonusStatus: transaction.bonusStatus,
    turnoverRequirement: transaction.turnoverRequirement,
    turnoverCompleted: transaction.turnoverCompleted,
    isTurnoverCompleted: transaction.isTurnoverCompleted,
    expiryDate: transaction.expiryDate,
    datetime: transaction.datetime,
    updatetime: transaction.updatetime,
    user: transaction.userId
      ? {
        name: transaction.userId.name,
        username: transaction.userId.username,
        email: transaction.userId.email,
      }
      : null,
    bonus: transaction.bonusId
      ? {
        name: transaction.bonusId.name,
        description: transaction.bonusId.description,
      }
      : null,
  };
};

exports.getTransactions = catchAsync(async (req, res, next) => {
  // const userId = req.user._id || req.user.id;
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      gateway_name,
      startDate,
      endDate,
      search,
      sort = "-datetime",
    } = req.query;
    console.log(
      "req.user",
      type,
      status,
      gateway_name,
      startDate,
      endDate,
      search
    );
    const userId = req.user.userId;
    // Build query
    console.log("userId", userId);
    let query = { userId };

    // Filter by transaction type
    if (type && ["0", "1", "2", "3"].includes(type)) {
      query.type = parseInt(type);
    }

    // Filter by status
    if (status && ["0", "1", "2", "3"].includes(status)) {
      query.status = parseInt(status);
    }

    // Filter by gateway
    if (
      gateway_name &&
      ["Bkash", "Nagad", "Rocket", "Upay", "transfer"].includes(gateway_name)
    ) {
      query.gateway_name = gateway_name;
    }

    // Filter by date range
    // if (startDate || endDate) {
    //     query.datetime = {};
    //     if (startDate) {
    //         query.datetime.$gte = new Date(startDate);
    //     }
    //     if (endDate) {
    //         query.datetime.$lte = new Date(endDate);
    //     }
    // }

    // Search by transaction ID or mobile
    if (search) {
      query.$or = [
        { transactionID: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await TransactionModel.countDocuments(query);

    // Get transactions with pagination
    const transactions = await TransactionModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format response for frontend
    const formattedTransactions = formatTransactionsForFrontend(transactions);

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getTransactions Error:", error);
    return next(new AppError("Server error", 500));
  }
});
