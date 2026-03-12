const User = require("../models/User");
const SubAdminModel = require("../models/SubAdminModel");
const AffiliateModel = require("../models/AffiliateModel");
const AdminModel = require("../models/AdminModel");
const ReferralChain = require("../models/ReferralChain");
const BonusTransaction = require("../models/BonusTransaction");
const {
  createOrUpdateReferralChain,
  getUserRoleAndDetails,
} = require("../utils/referralChainUtils");

/**
 * বোনাস ক্যালকুলেশন সার্ভিস
 * এই সার্ভিস দিয়ে বোনাস ক্যালকুলেট এবং ডিডাক্ট করা হবে
 */

/**
 * বোনাস পার্সেন্টেজ কনফিগারেশন
 * রোল এবং লেভেল অনুযায়ী বোনাস পার্সেন্টেজ
 */
const BONUS_CONFIG = {
  // Deposit bonus (যে ডিপজিট করছে তার জন্য)
  depositBonus: {
    default: 10, // 10% deposit bonus
    vip: 15, // VIP users get 15%
    firstDeposit: 20, // First deposit gets 20%
  },

  // Referral bonus (যে রেফার করেছে তার জন্য)
  referralBonus: {
    admin: {
      direct: 5, // Direct referral থেকে 5%
      level1: 3, // Level 1 থেকে 3%
      level2: 2, // Level 2 থেকে 2%
      level3: 1, // Level 3 থেকে 1%
    },
    subAdmin: {
      direct: 5,
      level1: 3,
      level2: 2,
      level3: 1,
    },
    affiliate: {
      direct: 7, // Affiliate gets higher percentage
      level1: 4,
      level2: 3,
      level3: 2,
    },
    user: {
      direct: 2, // Normal users get less
      level1: 1,
      level2: 0.5,
      level3: 0,
    },
  },
};

/**
 * ডিপজিট বোনাস ক্যালকুলেট করা
 */
function calculateDepositBonus(
  depositAmount,
  userDetails,
  isFirstDeposit = false,
  overrideConfig = null
) {
  if (
    overrideConfig &&
    typeof overrideConfig.percentage === "number" &&
    overrideConfig.percentage >= 0
  ) {
    const overrideBonusAmount = (depositAmount * overrideConfig.percentage) / 100;
    return {
      bonusAmount: overrideBonusAmount,
      bonusPercentage: overrideConfig.percentage,
      source: "promotion_override",
    };
  }

  let bonusPercentage = BONUS_CONFIG.depositBonus.default;

  // First deposit চেক
  if (isFirstDeposit) {
    bonusPercentage = BONUS_CONFIG.depositBonus.firstDeposit;
  }
  // VIP check (যদি আপনার VIP system থাকে)
  else if (userDetails.vipLevel && userDetails.vipLevel > 0) {
    bonusPercentage = BONUS_CONFIG.depositBonus.vip;
  }

  const bonusAmount = (depositAmount * bonusPercentage) / 100;
  return {
    bonusAmount,
    bonusPercentage,
    source: "default",
  };
}

/**
 * রেফারেল বোনাস ক্যালকুলেট করা (multi-level)
 */
function calculateReferralBonus(depositAmount, referrerRole, level = 0) {
  const roleConfig = BONUS_CONFIG.referralBonus[referrerRole] || BONUS_CONFIG.referralBonus.user;

  let bonusPercentage = 0;
  switch (level) {
    case 0: // Direct referral
      bonusPercentage = roleConfig.direct;
      break;
    case 1:
      bonusPercentage = roleConfig.level1;
      break;
    case 2:
      bonusPercentage = roleConfig.level2;
      break;
    case 3:
      bonusPercentage = roleConfig.level3;
      break;
    default:
      bonusPercentage = 0;
  }

  const bonusAmount = (depositAmount * bonusPercentage) / 100;
  return {
    bonusAmount,
    bonusPercentage,
  };
}

/**
 * ইউজারের ব্যালেন্স আপডেট করা (role অনুযায়ী)
 */
async function updateUserBalance(userId, role, amount, operation = "add") {
  try {
    let Model;
    switch (role) {
      case "admin":
        Model = AdminModel;
        break;
      case "subAdmin":
        Model = SubAdminModel;
        break;
      case "affiliate":
        Model = AffiliateModel;
        break;
      default:
        Model = User;
    }

    const updateOperation =
      operation === "add"
        ? { $inc: { balance: amount } }
        : { $inc: { balance: -amount } };

    const result = await Model.findOneAndUpdate(
      { userId },
      updateOperation,
      { new: true }
    );

    return result;
  } catch (error) {
    console.error("Error in updateUserBalance:", error);
    throw error;
  }
}

/**
 * মেইন ফাংশন: ডিপজিট প্রসেস করা এবং বোনাস ডিডাক্ট করা
 */
async function processDepositWithBonus(depositData) {
  try {
    const {
      userId, // যে ডিপজিট করছে
      depositAmount,
      gatewayId,
      paymentMethod,
      transactionReference,
      depositBonusOverride,
      promoContext,
    } = depositData;

    // ============================================
    // Step 1: Referral Chain তৈরি বা আপডেট করা
    // ============================================
    let referralChain = await ReferralChain.findOne({ userId });
    if (!referralChain) {
      referralChain = await createOrUpdateReferralChain(userId);
    }

    // ============================================
    // Step 2: User details নিয়ে আসা
    // ============================================
    const userDetails = await getUserRoleAndDetails(userId);
    if (!userDetails) {
      throw new Error("User not found");
    }

    // ============================================
    // Step 3: First deposit চেক করা
    // ============================================
    const isFirstDeposit = await checkIsFirstDeposit(userId);

    // ============================================
    // Step 4: Deposit বোনাস ক্যালকুলেট করা
    // ============================================
    const depositBonus = calculateDepositBonus(
      depositAmount,
      userDetails,
      isFirstDeposit,
      depositBonusOverride || null
    );

    // ============================================
    // Step 5: Bonus deduction owner খুঁজে বের করা
    // ============================================
    const bonusDeductionOwner = referralChain.bonusDeductionOwner;
    if (!bonusDeductionOwner) {
      throw new Error("Bonus deduction owner not found");
    }

    // ============================================
    // Step 6: Bonus deduction owner এর balance চেক করা
    // ============================================
    const deductionOwnerDetails = await getUserRoleAndDetails(
      bonusDeductionOwner.userId
    );
    
    let ownerBalance = 0;
    if (deductionOwnerDetails.role === "admin") {
      const admin = await AdminModel.findOne({ userId: bonusDeductionOwner.userId });
      ownerBalance = admin?.balance || 0;
    } else if (deductionOwnerDetails.role === "subAdmin") {
      const subAdmin = await SubAdminModel.findOne({ userId: bonusDeductionOwner.userId });
      ownerBalance = subAdmin?.balance || 0;
    } else if (deductionOwnerDetails.role === "affiliate") {
      const affiliate = await AffiliateModel.findOne({ userId: bonusDeductionOwner.userId });
      ownerBalance = affiliate?.balance || 0;
    }

    // যদি পর্যাপ্ত ব্যালেন্স না থাকে
    if (ownerBalance < depositBonus.bonusAmount) {
      throw new Error(
        `Insufficient balance in ${bonusDeductionOwner.role}'s account. Required: ${depositBonus.bonusAmount}, Available: ${ownerBalance}`
      );
    }

    // ============================================
    // Step 7: Transaction ID তৈরি করা
    // ============================================
    const transactionId = `BTX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ============================================
    // Step 8: Bonus deduct করা (owner থেকে কেটে নেওয়া)
    // ============================================
    await updateUserBalance(
      bonusDeductionOwner.userId,
      bonusDeductionOwner.role,
      depositBonus.bonusAmount,
      "deduct"
    );

    // ============================================
    // Step 9: User কে deposit + bonus দেওয়া
    // ============================================
    const totalAmount = depositAmount + depositBonus.bonusAmount;
    await updateUserBalance(userId, userDetails.role, totalAmount, "add");

    // ============================================
    // Step 10: Bonus transaction রেকর্ড করা
    // ============================================
    const bonusTransaction = await BonusTransaction.create({
      transactionId,
      depositorUserId: userId,
      bonusDeductedFrom: bonusDeductionOwner.userId,
      depositAmount,
      bonusPercentage: depositBonus.bonusPercentage,
      bonusAmount: depositBonus.bonusAmount,
      transactionType: "deposit_bonus",
      gatewayUsed: {
        gatewayId,
        gatewayOwnerId: referralChain.gatewayOwner?.userId,
        gatewayType: paymentMethod,
      },
      referralChainSnapshot: referralChain.fullChain,
      status: "completed",
      completedAt: new Date(),
      details: {
        paymentMethod,
        transactionReference,
        promotion: promoContext || null,
      },
    });

    // ============================================
    // Step 11: Multi-level referral bonus দেওয়া
    // ============================================
    await processMultiLevelReferralBonus(
      depositAmount,
      referralChain,
      transactionId
    );

    // ============================================
    // Step 12: Referral chain statistics আপডেট করা
    // ============================================
    await ReferralChain.findOneAndUpdate(
      { userId: bonusDeductionOwner.userId },
      {
        $inc: { totalBonusDeducted: depositBonus.bonusAmount },
      }
    );

    return {
      success: true,
      transactionId,
      depositAmount,
      bonusAmount: depositBonus.bonusAmount,
      totalAmount,
      bonusDeductedFrom: bonusDeductionOwner.userId,
      bonusTransaction,
    };
  } catch (error) {
    console.error("Error in processDepositWithBonus:", error);
    throw error;
  }
}

/**
 * Multi-level referral bonus প্রসেস করা
 */
async function processMultiLevelReferralBonus(
  depositAmount,
  referralChain,
  parentTransactionId
) {
  try {
    const maxLevels = 3; // Maximum 3 levels of referral bonus

    // Chain এর প্রথম element ছাড়া বাকিগুলো process করব (user নিজে ছাড়া)
    for (let i = 1; i <= Math.min(referralChain.fullChain.length - 1, maxLevels + 1); i++) {
      const referrer = referralChain.fullChain[i];
      const level = i - 1; // 0-based level (0 = direct, 1 = level1, etc.)

      // Referral bonus calculate করি
      const referralBonus = calculateReferralBonus(
        depositAmount,
        referrer.role,
        level
      );

      // যদি bonus amount 0 হয় তাহলে skip করি
      if (referralBonus.bonusAmount <= 0) {
        continue;
      }

      // Referrer কে bonus দিই
      await updateUserBalance(
        referrer.userId,
        referrer.role,
        referralBonus.bonusAmount,
        "add"
      );

      // Transaction record করি
      const transactionId = `RTX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      let transactionType = "referral_bonus";
      if (level === 0) transactionType = "referral_bonus";
      else if (level === 1) transactionType = "level1_bonus";
      else if (level === 2) transactionType = "level2_bonus";
      else if (level === 3) transactionType = "level3_bonus";

      await BonusTransaction.create({
        transactionId,
        depositorUserId: referralChain.userId,
        bonusDeductedFrom: referrer.userId, // এক্ষেত্রে bonus দেওয়া হচ্ছে
        depositAmount,
        bonusPercentage: referralBonus.bonusPercentage,
        bonusAmount: referralBonus.bonusAmount,
        transactionType,
        status: "completed",
        completedAt: new Date(),
        details: {
          parentTransactionId,
          level,
          notes: `Level ${level} referral bonus`,
        },
      });

      // Referrer এর total bonus earned আপডেট করি
      await ReferralChain.findOneAndUpdate(
        { userId: referrer.userId },
        {
          $inc: { totalBonusEarned: referralBonus.bonusAmount },
        }
      );
    }
  } catch (error) {
    console.error("Error in processMultiLevelReferralBonus:", error);
    // Multi-level bonus এ error হলে main transaction fail করব না
  }
}

/**
 * First deposit চেক করা
 */
async function checkIsFirstDeposit(userId) {
  try {
    const existingDeposit = await BonusTransaction.findOne({
      depositorUserId: userId,
      transactionType: "deposit_bonus",
      status: "completed",
    });

    return !existingDeposit;
  } catch (error) {
    console.error("Error in checkIsFirstDeposit:", error);
    return false;
  }
}

/**
 * ইউজারের bonus statistics নিয়ে আসা
 */
async function getUserBonusStatistics(userId) {
  try {
    // Total bonus earned (referral bonus)
    const earnedBonuses = await BonusTransaction.aggregate([
      {
        $match: {
          bonusDeductedFrom: userId,
          transactionType: { $in: ["referral_bonus", "level1_bonus", "level2_bonus", "level3_bonus"] },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: "$bonusAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total bonus deducted (deposit bonus কেটে নেওয়া)
    const deductedBonuses = await BonusTransaction.aggregate([
      {
        $match: {
          bonusDeductedFrom: userId,
          transactionType: "deposit_bonus",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalDeducted: { $sum: "$bonusAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total bonus received (as depositor)
    const receivedBonuses = await BonusTransaction.aggregate([
      {
        $match: {
          depositorUserId: userId,
          transactionType: "deposit_bonus",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: "$bonusAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      earned: {
        total: earnedBonuses[0]?.totalEarned || 0,
        count: earnedBonuses[0]?.count || 0,
      },
      deducted: {
        total: deductedBonuses[0]?.totalDeducted || 0,
        count: deductedBonuses[0]?.count || 0,
      },
      received: {
        total: receivedBonuses[0]?.totalReceived || 0,
        count: receivedBonuses[0]?.count || 0,
      },
      netBonus: (earnedBonuses[0]?.totalEarned || 0) - (deductedBonuses[0]?.totalDeducted || 0),
    };
  } catch (error) {
    console.error("Error in getUserBonusStatistics:", error);
    return {
      earned: { total: 0, count: 0 },
      deducted: { total: 0, count: 0 },
      received: { total: 0, count: 0 },
      netBonus: 0,
    };
  }
}

module.exports = {
  BONUS_CONFIG,
  calculateDepositBonus,
  calculateReferralBonus,
  processDepositWithBonus,
  processMultiLevelReferralBonus,
  getUserBonusStatistics,
  updateUserBalance,
};
