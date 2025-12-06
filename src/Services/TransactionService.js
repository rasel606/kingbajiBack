


// const TransactionModel = require("../Models/TransactionModel");
// const User = require("../Models/User");
// const Bonus = require("../Models/Bonus");
// const UserBonus = require("../Models/UserBonus");
// const notificationController = require("../Controllers/notificationController");
// const { getUserWithReferralLevels, getReferralOwner } = require("./getReferralOwner");

// // ✅ Process Transaction (Deposit / Withdraw / Reject) with Affiliate bonus deduction
// const processTransaction = async ({ userId, action, transactionID, referralUser }) => {
//   console.log("processTransaction", userId, action, transactionID, referralUser);
//   // 1️⃣ User & Referral Validation
//   const user = await getUserWithReferralLevels(userId);
//   console.log("processTransaction user", user);
//   if (!user || user.referredBy !== referralUser.referralCode)
//     throw new Error("User not found or referral mismatch");

//   const referralData = await getReferralOwner(referralUser.referralCode);
//   console.log("processTransaction referralData", referralData);
//   if (!referralData) throw new Error("Invalid referral owner");

//   const paymentOwner =
//     referralData.role === "affiliate" ? referralData.subAdmin : referralData.owner;
//   if (!paymentOwner) throw new Error("Payment owner not found");

//   // 2️⃣ Find Transaction
//   let transaction = await TransactionModel.findOne({ transactionID, status: 0 });
//   if (!transaction) throw new Error("Transaction not found or already processed");

//   const baseAmount = parseFloat(transaction.amount);
//   const type = transaction.type;
//   if (isNaN(baseAmount) || baseAmount <= 0) throw new Error("Invalid amount");

//   // ✅ Reject Transaction
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

//   // ✅ Deposit Transaction
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

//       // ✅ Deduct bonus from Affiliate if applicable
//       if (referralData.role === "affiliate" && referralData.owner) {
//         if (referralData.owner.balance < bonusAmount)
//           throw new Error("Affiliate balance insufficient for bonus");
//         referralData.owner.balance -= bonusAmount;
//         await referralData.owner.save();
//       }
//     }

//     // ✅ Check SubAdmin/Owner balance for deposit
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

//     // ✅ Create UserBonus record if bonus applied
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

//   // ✅ Withdraw Transaction
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


// services/transactionService.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/AdminModel');
const SubAdmin = require('../models/SubAdminModel');
const Affiliate = require('../models/AffiliateModel');
const Agent = require('../models/AgentModel');
const SubAgent = require('../models/SubAgentModel');
const Transaction = require('../models/TransactionModel');
const Bonus = require('../models/Bonus');
const UserBonus = require('../models/UserBonus');
const AppError = require('../utils/AppError');
const notificationController = require('../Controllers/notificationController');
const { generateReferralCode } = require('../utils/generateReferralCode');

// Helper: find referral owner (Admin/SubAdmin/Affiliate/Agent/SubAgent)
const getReferralOwner = async (referralCode) => {
  if (!referralCode) return null;

  const subAdmin = await SubAdmin.findOne({ referralCode });
  if (subAdmin) return { owner: subAdmin, role: 'subadmin', referralCode: subAdmin.referralCode };

  const affiliate = await Affiliate.findOne({ referralCode });
  if (affiliate) {
    // find affiliate parent if exists
    let parent = null;
    if (affiliate.referredBy) {
      parent = (await SubAdmin.findOne({ referralCode: affiliate.referredBy })) || (await Admin.findOne({ referralCode: affiliate.referredBy }));
    }
    return { owner: affiliate, role: 'affiliate', referralCode: affiliate.referralCode, parent };
  }

  const agent = await Agent.findOne({ referralCode });
  if (agent) return { owner: agent, role: 'agent', referralCode: agent.referralCode };

  const subAgent = await SubAgent.findOne({ referralCode });
  if (subAgent) {
    let parent = null;
    if (subAgent.referredBy) parent = await Agent.findOne({ referralCode: subAgent.referredBy });
    return { owner: subAgent, role: 'subagent', referralCode: subAgent.referralCode, parent };
  }

  const admin = await Admin.findOne({ referralCode });
  if (admin) return { owner: admin, role: 'admin', referralCode: admin.referralCode || '1' };

  return null;
};

// Helper: If referredBy belongs to Affiliate, return {affiliate, parent}
const getAffiliateAndParent = async (referralCode) => {
  if (!referralCode) return null;
  const affiliate = await Affiliate.findOne({ referralCode });
  if (!affiliate) return null;
  let parent = null;
  if (affiliate.referredBy) {
    parent = (await Admin.findOne({ referralCode: affiliate.referredBy })) || (await SubAdmin.findOne({ referralCode: affiliate.referredBy }));
  }
  return { affiliate, parent };
};

// submit transaction logic (same as controller uses)
const submitTransaction = async (payload) => {
  // payload should include: userId, gateway_name, base_amount, referredBy, payment_type, gateway_Number, transactionID, bonusCode
  // This function can be used directly in controller (we provide controller wrapper below)
  const { userId, gateway_name, base_amount, referredBy, payment_type, gateway_Number, transactionID, bonusCode } = payload;
  if (!userId || !base_amount || !referredBy || !payment_type || !transactionID || !gateway_name || !gateway_Number) {
    throw new AppError('All fields are required', 400);
  }
  const baseAmount = Number(base_amount);
  if (isNaN(baseAmount) || baseAmount <= 0) throw new AppError('Invalid base amount', 400);

  const user = await User.findOne({ userId });
  if (!user) throw new AppError('User not found', 404);

  const existing = await Transaction.findOne({ userId, referredBy: user.referredBy, transactionID, payment_type });
  if (existing) throw new AppError('Transaction already used', 409);

  let bonusAmount = 0, bonusId = null, turnoverRequirement = 0;
  if (baseAmount >= 200 && bonusCode) {
    const depositBonus = await Bonus.findOne({ isActive: true, minDeposit: { $lte: baseAmount }, _id: bonusCode });
    if (depositBonus) {
      bonusAmount = depositBonus.fixedAmount || Math.floor((baseAmount * (depositBonus.percentage || 0)) / 100);
      if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus) bonusAmount = depositBonus.maxBonus;
      bonusId = depositBonus._id;
      turnoverRequirement = (baseAmount + bonusAmount) * (depositBonus.wageringRequirement || 0);
    }
  }

  const newTransaction = await Transaction.create({
    userId: user.userId,
    transactionID,
    base_amount: baseAmount,
    bonus_amount: bonusAmount,
    amount: baseAmount + bonusAmount,
    gateway_name,
    gateway_Number,
    payment_type,
    mobile: user.phone?.[0]?.number || '',
    type: 0,
    status: 0,
    referredBy: user.referredBy,
    bonusId,
    isBonusApplied: bonusAmount > 0,
    bonusStatus: bonusAmount > 0 ? 'pending' : undefined,
    turnoverRequirement,
    expiryDate: bonusAmount > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
  });

  await notificationController.createNotification(
    `Deposit Request by ${user.name}`,
    user.userId,
    `Deposit of ${newTransaction.amount} submitted via ${gateway_name}`,
    'deposit_request',
    { amount: newTransaction.amount, transactionID }
  );

  return newTransaction;
};

// approve deposit - uses MongoDB session to keep atomic changes
const approveDeposit = async ({ userId, referralCode, transactionID, status }) => {
  if (!userId || !transactionID) throw new AppError('Missing userId or transactionID', 400);
  const user = await User.findOne({ userId });
  if (!user) throw new AppError('User not found', 404);

  const transaction = await Transaction.findOne({ userId, transactionID, type: 0 });
  if (!transaction) throw new AppError('Transaction not found', 404);
  if (transaction.status !== 0) throw new AppError('Transaction already processed', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let affiliateBonusCut = 0;

    if (parseInt(status) === 1) {
      // APPROVE
      const affiliateRelation = await getAffiliateAndParent(user.referredBy);

      if (affiliateRelation) {
        const { affiliate, parent } = affiliateRelation;

        affiliateBonusCut = transaction.bonus_amount || 0;
        if (affiliateBonusCut > 0) {
          const affBonusBalance = Number(affiliate.bonusBalance || 0);
          if (affBonusBalance < affiliateBonusCut) throw new AppError('Affiliate bonus balance insufficient', 400);
          affiliate.bonusBalance = affBonusBalance - affiliateBonusCut;
          await affiliate.save({ session });
        }

        if (!parent) throw new AppError('Affiliate parent (Admin/SubAdmin) not found', 400);

        const baseAmount = Number(transaction.base_amount || 0);
        const parentBalance = Number(parent.balance || 0);
        if (parentBalance < baseAmount) throw new AppError('Parent balance insufficient', 400);

        parent.balance = parentBalance - baseAmount;
        await parent.save({ session });

        user.balance = Number(user.balance || 0) + Number(transaction.amount || 0);
        await user.save({ session });

      } else {
        // Normal gateway owner flow
        const gatewayOwnerData = await getReferralOwner(referralCode);
        if (!gatewayOwnerData || !gatewayOwnerData.owner) throw new AppError('Payment gateway owner not found', 404);

        const gatewayOwner = gatewayOwnerData.owner;
        const ownerBalance = Number(gatewayOwner.balance || 0);
        const amountToDebit = Number(transaction.amount || 0);
        if (ownerBalance < amountToDebit) throw new AppError('Insufficient gateway balance', 400);

        gatewayOwner.balance = ownerBalance - amountToDebit;
        await gatewayOwner.save({ session });

        user.balance = Number(user.balance || 0) + amountToDebit;
        await user.save({ session });
      }

      transaction.status = 1;
      transaction.updatetime = new Date();
      transaction.bonusStatus = transaction.isBonusApplied ? 'active' : transaction.bonusStatus;
      await transaction.save({ session });

      if (transaction.isBonusApplied && transaction.bonusId) {
        const bonusDoc = await Bonus.findById(transaction.bonusId).session(session);
        if (bonusDoc) {
          await UserBonus.create([{
            userId: user.userId,
            bonusId: bonusDoc._id,
            amount: transaction.amount,
            bonusAmount: transaction.bonus_amount,
            remainingAmount: transaction.bonus_amount,
            turnoverRequirement: transaction.turnoverRequirement,
            expiryDate: transaction.expiryDate,
            transactionId: transaction.transactionID
          }], { session });

          user.bonus = {
            active: true,
            bonusAmount: transaction.bonus_amount,
            wageringRequirement: transaction.turnoverRequirement,
            completedTurnover: 0
          };
          await user.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      await notificationController.createNotification(
        'Deposit Approved',
        user.userId,
        `Your deposit of ${transaction.amount} has been approved`,
        'deposit_approved',
        { amount: transaction.amount, transactionID: transaction.transactionID }
      );

      return { transaction, affiliateBonusCut };
    } else if (parseInt(status) === 2) {
      // REJECT
      transaction.status = 2;
      transaction.updatetime = new Date();
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      await notificationController.createNotification(
        'Deposit Rejected',
        user.userId,
        `Your deposit of ${transaction.amount} has been rejected`,
        'deposit_rejected',
        { amount: transaction.amount, transactionID: transaction.transactionID }
      );

      return { transaction };
    } else {
      throw new AppError('Invalid status value. Use 1 for approve or 2 for reject.', 400);
    }
  } catch (err) {
    await session.abortTransaction().catch(() => { });
    session.endSession();
    throw err;
  }
};






const WithdrawTransaction = async (payload) => {
  const { userId, amount, gateway_name, mobile } = payload;
  console.log(req.body);

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User Balance Before Withdrawal:", user.balance);

    // Check if the user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    if (user.balance > 0 && user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }


    const transactionID = generateReferralCode();
    const newTransaction = new Transaction({
      userId: user.userId,
      transactionID,
      base_amount: amount,
      amount: amount,
      gateway_name: gateway_name,
      mobile: mobile,
      type: 1,  // Withdrawal type
      status: 0,  // 0 = pending
      referredBy: referredBy,
      // is_commission: false,
    });

    // Deduct balance
    user.balance -= parseInt(amount);

    // Save transaction and user balance update
    await newTransaction.save();
    await user.save();

    console.log("New Transaction:", newTransaction);
    console.log("Updated User:", user);

    await notificationController.createNotification(
      `Withdrawal request send ${newTransaction.transactionID} with (User ID: ${user.userId})`,
      newTransaction.userId,
      `Withdrawal of ${newTransaction.amount} has been submitted at ${new Date()}  by ${newTransaction.gateway_name}.Your withdrawal request of ${newTransaction.amount} has been send at ${new Date()} with transaction ID: ${newTransaction.transactionID} by ${newTransaction.gateway_name} and will be processed within 15 minutes.`,
      'withdrawal_request',
      { amount: newTransaction.amount, transactionID: newTransaction.transactionID }
    );

    res.json({
      message: "Withdrawal request submitted successfully",
      transactionID,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


const approveWithdraw = async ({ userId, referralCode, transactionID, status }) => {
  try {
  if (!userId || !transactionID) throw new AppError('Missing userId or transactionID', 400);
  const user = await User.findOne({ userId });
  if (!user) throw new AppError('User not found', 404);

  const transaction = await Transaction.findOne({ userId, transactionID, type: 0 });
  if (!transaction) throw new AppError('Transaction not found', 404);
  if (transaction.status !== 0) throw new AppError('Transaction already processed', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  


    if (parseInt(status) === 1) {
      // APPROVE
      const affiliateRelation = await getAffiliateAndParent(user.referredBy);

      if (affiliateRelation) {
        const { affiliate, parent } = affiliateRelation;

        if (!parent) throw new AppError('Affiliate parent (Admin/SubAdmin) not found', 400);

        const baseAmount = Number(transaction.base_amount || 0);
        const parentBalance = Number(parent.balance || 0);
        if (parentBalance < baseAmount) throw new AppError('Parent balance insufficient', 400);

        parent.balance = parentBalance + baseAmount;
        await parent.save({ session });

        user.balance = Number(user.balance || 0) - Number(transaction.amount || 0);
        await user.save({ session });

      } else {
        // Normal gateway owner flow
        const gatewayOwnerData = await getReferralOwner(referralCode);
        if (!gatewayOwnerData || !gatewayOwnerData.owner) throw new AppError('Payment gateway owner not found', 404);

        const gatewayOwner = gatewayOwnerData.owner;
        const ownerBalance = Number(gatewayOwner.balance || 0);
        const amountToDebit = Number(transaction.amount || 0);
        if (ownerBalance < amountToDebit) throw new AppError('Insufficient gateway balance', 400);

        gatewayOwner.balance = ownerBalance + amountToDebit;
        await gatewayOwner.save({ session });

        user.balance = Number(user.balance || 0) - amountToDebit;
        await user.save({ session });
      }

      transaction.status = 1;
      transaction.updatetime = new Date();
      await transaction.save({ session });



      await session.commitTransaction();
      session.endSession();

      await notificationController.createNotification(
        'Deposit Approved',
        user.userId,
        `Your deposit of ${transaction.amount} has been approved`,
        'deposit_approved',
        { amount: transaction.amount, transactionID: transaction.transactionID }
      );

      return { transaction, affiliateBonusCut };
    } else if (parseInt(status) === 2) {
      // REJECT
      transaction.status = 2;
      transaction.updatetime = new Date();
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      await notificationController.createNotification(
        'Deposit Rejected',
        user.userId,
        `Your deposit of ${transaction.amount} has been rejected`,
        'deposit_rejected',
        { amount: transaction.amount, transactionID: transaction.transactionID }
      );

      return { transaction };
    } else {
      throw new AppError('Invalid status value. Use 1 for approve or 2 for reject.', 400);
    }
  } catch (err) {
    await session.abortTransaction().catch(() => { });
    session.endSession();
    throw err;
  }
};




const Approve_Transfar_With_Deposit_And_Widthraw_By_Admin = async ({ userId, email, dataModel, OwnerModel, transactionModel, referralCode, type, amount }) => {
  try {


    const transactionType = parseInt(type);
    const baseAmountInt = parseInt(amount);

    if (!userId || !referralCode || !email || !mobile || isNaN(baseAmountInt) || isNaN(transactionType)) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    const user = await dataModel.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found or referral code mismatch' });
    }



    const Admin = await OwnerModel.findOne({ email });
    if (!Admin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }



    if (baseAmountInt <= 50) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const transactionID = generateReferralCode();

    const isValidTransaction =
      user.userId === userId &&
      Admin.email === email &&
      baseAmountInt > 0;

    // ✅ Withdrawal
    if (transactionType === 1) {
      if (user.balance < baseAmountInt) {
        return res.status(400).json({ message: 'User does not have sufficient balance for withdrawal' });
      }

      const newTransaction = new Transaction({
        userId: user.userId,
        transactionID,
        base_amount: baseAmountInt,
        amount: baseAmountInt,
        gateway_name: "transfer",
        payment_type: "transfer",
        mobile,
        type: 1,
        status: 1,
        referredBy: user.referralCode,
        is_commission: false,

      });

      user.balance -= baseAmountInt;
      subAdmin.balance += baseAmountInt;

      await newTransaction.save();
      await user.save();
      await subAdmin.save();

      return res.status(200).json({
        message: "Withdrawal transaction completed successfully",
        userBalance: user.balance,
        AdminBalance: Admin.balance
      });
    }

    // ✅ Deposit
    else if (transactionType === 0) {
      if (subAdmin.balance < baseAmountInt) {
        return res.status(400).json({ message: 'Sub-admin does not have sufficient balance for deposit' });
      }



      const newTransaction = new Transaction({
        userId: user.userId,
        transactionID,
        base_amount: baseAmountInt,
        bonus_amount: 0,
        amount: baseAmountInt,
        gateway_name: "transfer",
        payment_type: "transfer",
        mobile,
        type: 0,
        status: 1,
        referredBy: referralCode,
        is_commission: false,

      });

      user.balance += baseAmountInt;
      subAdmin.balance -= baseAmountInt;

      await newTransaction.save();
      await user.save();
      await subAdmin.save();

      return res.status(200).json({
        message: "Deposit transaction completed successfully with bonus",
        userBalance: user.balance,
        subAdminBalance: subAdmin.balance
      });
    }

    return res.status(400).json({ message: 'Invalid transaction type or conditions not met' });

  } catch (error) {
    console.error('Transaction Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};




module.exports = {
  submitTransaction,
  approveDeposit,
  getReferralOwner,
  approveWithdraw,
  WithdrawTransaction,
  Approve_Transfar_With_Deposit_And_Widthraw_By_Admin
};
