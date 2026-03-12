const {
  processDepositWithBonus,
  getUserBonusStatistics,
} = require("../services/bonusCalculationService");
const {
  evaluateDepositPromotion,
  finalizePromotionClaim,
} = require("../services/depositPromoService");
const {
  createOrUpdateReferralChain,
  getAllGatewaysForUser,
} = require("../utils/referralChainUtils");
const Deposit = require("../models/Deposit");
const Gateway = require("../models/Gateway");
const ReferralChain = require("../models/ReferralChain");
const BonusTransaction = require("../models/BonusTransaction");

/**
 * Deposit Controller with Advanced Bonus System
 */

/**
 * ডিপজিট রিকোয়েস্ট তৈরি করা (বোনাস সহ)
 * POST /api/deposit/create
 */
exports.createDepositWithBonus = async (req, res) => {
  try {
    const {
      amount,
      gatewayId,
      paymentMethod,
      transactionReference,
      accountNumber,
      mobile,
      promoCode,
    } = req.body;

    const userId = req.user?.userId || req.body.userId;

    // Validation
    if (!userId || !amount || !gatewayId || !mobile) {
      return res.status(400).json({
        success: false,
        message: "userId, amount, gatewayId এবং mobile প্রয়োজন",
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "মিনিমাম ডিপজিট পরিমাণ 100 টাকা",
      });
    }

    // Gateway verify করা
    const gateway = await Gateway.findOne({ gatewayId, isActive: true });
    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি বা সক্রিয় নেই",
      });
    }

    // Gateway limit check
    if (amount < gateway.minDeposit || amount > gateway.maxDeposit) {
      return res.status(400).json({
        success: false,
        message: `ডিপজিট পরিমাণ ${gateway.minDeposit} থেকে ${gateway.maxDeposit} এর মধ্যে হতে হবে`,
      });
    }

    let promoEvaluation = null;
    if (promoCode) {
      promoEvaluation = await evaluateDepositPromotion({
        userId,
        depositAmount: amount,
        promoCode,
      });
    }

    // Process deposit with bonus
    const result = await processDepositWithBonus({
      userId,
      depositAmount: amount,
      gatewayId,
      paymentMethod: paymentMethod || gateway.gatewayType,
      transactionReference: transactionReference || `DEP${Date.now()}`,
      depositBonusOverride: promoEvaluation
        ? {
            percentage: promoEvaluation.evaluation.bonusPercent,
          }
        : null,
      promoContext: promoEvaluation
        ? {
            promoCode: promoEvaluation.campaign.code,
            claimId: String(promoEvaluation.claim._id),
            vipLevel: promoEvaluation.claim.vipLevel,
            freeSpinCount: promoEvaluation.evaluation.freeSpinCount,
          }
        : null,
    });

    if (promoEvaluation) {
      await finalizePromotionClaim({
        claimId: promoEvaluation.claim._id,
        transactionId: result.transactionId,
        bonusAmount: result.bonusAmount,
      });
    }

    const gatewayNameMap = {
      bKash: "Bkash",
      Bkash: "Bkash",
      Nagad: "Nagad",
      Rocket: "Rocket",
      Upay: "Upay",
      Bank: "transfer",
      transfer: "transfer",
    };

    const normalizedGatewayName =
      gatewayNameMap[paymentMethod] || gatewayNameMap[gateway.gatewayType] || "transfer";

    // Create deposit record (TransactionModel-compatible fields)
    const deposit = await Deposit.create({
      userId,
      transactionID: result.transactionId,
      base_amount: amount,
      bonus_amount: result.bonusAmount,
      amount: result.totalAmount,
      mobile: Number(mobile),
      gateway_Number: Number(accountNumber || gateway.accountNumber || 0),
      gateway_name: normalizedGatewayName,
      type: 0,
      status: 1,
      details: `bonusDeductedFrom:${result.bonusDeductedFrom}; ref:${transactionReference || "NA"}`,
      payment_type: "Send Money",
      is_commission: false,
    });

    // Update gateway statistics
    await Gateway.findOneAndUpdate(
      { gatewayId },
      {
        $inc: {
          totalDeposits: amount,
          "statistics.successfulTransactions": 1,
        },
        $set: {
          "statistics.lastTransactionAt": new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "ডিপজিট সফলভাবে সম্পন্ন হয়েছে",
      data: {
        depositId: deposit._id,
        transactionId: result.transactionId,
        depositAmount: amount,
        bonusAmount: result.bonusAmount,
        totalAmount: result.totalAmount,
        bonusDeductedFrom: result.bonusDeductedFrom,
        deposit,
      },
    });
  } catch (error) {
    console.error("Error in createDepositWithBonus:", error);

    if (req.body?.promoCode && req.body?.userId) {
      // best-effort: promotion claim failure mark is handled from service caller when claim exists
      // avoid throwing from fallback cleanup
    }

    return res.status(500).json({
      success: false,
      message: error.message || "ডিপজিট প্রসেস করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * ইউজারের জন্য available gateways নিয়ে আসা
 * GET /api/deposit/available-gateways
 */
exports.getAvailableGateways = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    // User এর জন্য available gateways নিয়ে আসা
    const gateways = await getAllGatewaysForUser(userId);

    if (!gateways || gateways.length === 0) {
      return res.status(404).json({
        success: false,
        message: "কোনো সক্রিয় গেটওয়ে পাওয়া যায়নি",
      });
    }

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে তালিকা পাওয়া গেছে",
      data: {
        gateways: gateways.map((g) => ({
          gatewayId: g.gatewayId,
          gatewayName: g.gatewayName,
          gatewayType: g.gatewayType,
          accountNumber: g.accountNumber,
          accountName: g.accountName,
          minDeposit: g.minDeposit,
          maxDeposit: g.maxDeposit,
          ownerId: g.ownerId,
        })),
        count: gateways.length,
      },
    });
  } catch (error) {
    console.error("Error in getAvailableGateways:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে তালিকা পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * ইউজারের referral chain দেখা
 * GET /api/deposit/referral-chain
 */
exports.getReferralChain = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    let referralChain = await ReferralChain.findOne({ userId });

    // যদি না থাকে তাহলে তৈরি করি
    if (!referralChain) {
      referralChain = await createOrUpdateReferralChain(userId);
    }

    return res.status(200).json({
      success: true,
      message: "রেফারেল চেইন পাওয়া গেছে",
      data: {
        userId: referralChain.userId,
        referralCode: referralChain.referralCode,
        userRole: referralChain.userRole,
        userLevel: referralChain.userLevel,
        directReferrer: referralChain.directReferrer,
        gatewayOwner: referralChain.gatewayOwner,
        bonusDeductionOwner: referralChain.bonusDeductionOwner,
        fullChain: referralChain.fullChain,
        adminId: referralChain.adminId,
        subAdminId: referralChain.subAdminId,
        affiliateId: referralChain.affiliateId,
        hasOwnGateway: referralChain.hasOwnGateway,
        totalDirectReferrals: referralChain.totalDirectReferrals,
        totalIndirectReferrals: referralChain.totalIndirectReferrals,
        totalBonusEarned: referralChain.totalBonusEarned,
        totalBonusDeducted: referralChain.totalBonusDeducted,
      },
    });
  } catch (error) {
    console.error("Error in getReferralChain:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল চেইন পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * ইউজারের bonus statistics দেখা
 * GET /api/deposit/bonus-statistics
 */
exports.getBonusStatistics = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    const statistics = await getUserBonusStatistics(userId);

    return res.status(200).json({
      success: true,
      message: "বোনাস পরিসংখ্যান পাওয়া গেছে",
      data: statistics,
    });
  } catch (error) {
    console.error("Error in getBonusStatistics:", error);
    return res.status(500).json({
      success: false,
      message: "বোনাস পরিসংখ্যান পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * ইউজারের সব bonus transactions দেখা
 * GET /api/deposit/bonus-transactions
 */
exports.getBonusTransactions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { page = 1, limit = 20, type } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    const query = {
      $or: [{ depositorUserId: userId }, { bonusDeductedFrom: userId }],
    };

    // Filter by type if provided
    if (type) {
      query.transactionType = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      BonusTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BonusTransaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "বোনাস ট্রানজেকশন পাওয়া গেছে",
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getBonusTransactions:", error);
    return res.status(500).json({
      success: false,
      message: "বোনাস ট্রানজেকশন পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * Deposit history with bonus details
 * GET /api/deposit/history
 */
exports.getDepositHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { page = 1, limit = 20, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    const query = { userId };
    // deposit only
    query.type = 0;
    if (status !== undefined) {
      query.status = Number(status);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deposits, total] = await Promise.all([
      Deposit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Deposit.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "ডিপজিট হিস্ট্রি পাওয়া গেছে",
      data: {
        deposits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getDepositHistory:", error);
    return res.status(500).json({
      success: false,
      message: "ডিপজিট হিস্ট্রি পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * Referral chain rebuild করা (admin only)
 * POST /api/deposit/rebuild-chain
 */
exports.rebuildReferralChain = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    const referralChain = await createOrUpdateReferralChain(userId);

    return res.status(200).json({
      success: true,
      message: "রেফারেল চেইন পুনর্গঠন সফল হয়েছে",
      data: referralChain,
    });
  } catch (error) {
    console.error("Error in rebuildReferralChain:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল চেইন পুনর্গঠন করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = exports;
