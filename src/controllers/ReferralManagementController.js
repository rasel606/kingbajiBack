const ReferralChain = require("../models/ReferralChain");
const BonusTransaction = require("../models/BonusTransaction");
const User = require("../models/User");
const {
  createOrUpdateReferralChain,
  getUserRoleAndDetails,
  countUserReferrals,
  findReferrerByReferralCode,
} = require("../utils/referralChainUtils");

/**
 * Referral Management Controller
 */

/**
 * ইউজারের সব রেফারেল দেখা
 * GET /api/referral/my-referrals
 */
exports.getMyReferrals = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { level, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    // Query build করা
    let query = {};

    if (level === "direct") {
      // Direct referrals only
      query["directReferrer.userId"] = userId;
    } else if (level) {
      // Specific level
      query["fullChain"] = {
        $elemMatch: {
          userId: userId,
          level: parseInt(level),
        },
      };
    } else {
      // All referrals (direct + indirect)
      query["fullChain.userId"] = userId;
      query.userId = { $ne: userId }; // নিজেকে বাদ দিয়ে
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [referrals, total] = await Promise.all([
      ReferralChain.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ReferralChain.countDocuments(query),
    ]);

    // Referral counts
    const counts = await countUserReferrals(userId);

    return res.status(200).json({
      success: true,
      message: "রেফারেল তালিকা পাওয়া গেছে",
      data: {
        referrals,
        counts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getMyReferrals:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল তালিকা পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * রেফারেল ট্রি দেখা (hierarchical structure)
 * GET /api/referral/tree
 */
exports.getReferralTree = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { maxDepth = 3 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    // Build tree recursively
    const tree = await buildReferralTree(userId, parseInt(maxDepth));

    return res.status(200).json({
      success: true,
      message: "রেফারেল ট্রি পাওয়া গেছে",
      data: tree,
    });
  } catch (error) {
    console.error("Error in getReferralTree:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল ট্রি পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * Helper function: Referral tree build করা
 */
async function buildReferralTree(userId, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return null;
  }

  // User details নিয়ে আসা
  const userDetails = await getUserRoleAndDetails(userId);
  if (!userDetails) {
    return null;
  }

  // User এর referral chain নিয়ে আসা
  const referralChain = await ReferralChain.findOne({ userId });

  // Direct referrals খুঁজে বের করা
  const directReferrals = await ReferralChain.find({
    "directReferrer.userId": userId,
  }).limit(100); // Limit to prevent performance issues

  // Recursively build children
  const children = [];
  for (const referral of directReferrals) {
    const child = await buildReferralTree(
      referral.userId,
      maxDepth,
      currentDepth + 1
    );
    if (child) {
      children.push(child);
    }
  }

  return {
    userId: userDetails.userId,
    role: userDetails.role,
    referralCode: userDetails.referralCode,
    hasGateway: userDetails.hasGateway,
    level: currentDepth,
    directReferralsCount: directReferrals.length,
    totalBonusEarned: referralChain?.totalBonusEarned || 0,
    totalBonusDeducted: referralChain?.totalBonusDeducted || 0,
    children: children.length > 0 ? children : null,
  };
}

/**
 * রেফারেল পারফরমেন্স দেখা
 * GET /api/referral/performance
 */
exports.getReferralPerformance = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId প্রয়োজন",
      });
    }

    // Date range query
    const dateQuery = {};
    if (startDate) {
      dateQuery.$gte = new Date(startDate);
    }
    if (endDate) {
      dateQuery.$lte = new Date(endDate);
    }

    // Referral counts
    const counts = await countUserReferrals(userId);

    // Bonus earnings from referrals
    const bonusQuery = {
      bonusDeductedFrom: userId,
      transactionType: {
        $in: ["referral_bonus", "level1_bonus", "level2_bonus", "level3_bonus"],
      },
      status: "completed",
    };

    if (Object.keys(dateQuery).length > 0) {
      bonusQuery.completedAt = dateQuery;
    }

    const bonusEarnings = await BonusTransaction.aggregate([
      { $match: bonusQuery },
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$bonusAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Bonus deductions (for deposits)
    const deductionQuery = {
      bonusDeductedFrom: userId,
      transactionType: "deposit_bonus",
      status: "completed",
    };

    if (Object.keys(dateQuery).length > 0) {
      deductionQuery.completedAt = dateQuery;
    }

    const bonusDeductions = await BonusTransaction.aggregate([
      { $match: deductionQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$bonusAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent referrals
    const recentReferralsQuery = {
      "directReferrer.userId": userId,
    };

    if (Object.keys(dateQuery).length > 0) {
      recentReferralsQuery.createdAt = dateQuery;
    }

    const recentReferrals = await ReferralChain.find(recentReferralsQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      message: "রেফারেল পারফরমেন্স পাওয়া গেছে",
      data: {
        counts,
        bonusEarnings: bonusEarnings.reduce(
          (acc, item) => {
            acc[item._id] = {
              amount: item.totalAmount,
              count: item.count,
            };
            acc.total += item.totalAmount;
            return acc;
          },
          { total: 0 }
        ),
        bonusDeductions: {
          total: bonusDeductions[0]?.totalAmount || 0,
          count: bonusDeductions[0]?.count || 0,
        },
        netBonus:
          (bonusEarnings.reduce((sum, item) => sum + item.totalAmount, 0) || 0) -
          (bonusDeductions[0]?.totalAmount || 0),
        recentReferrals,
      },
    });
  } catch (error) {
    console.error("Error in getReferralPerformance:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল পারফরমেন্স পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * রেফারেল লিডারবোর্ড
 * GET /api/referral/leaderboard
 */
exports.getReferralLeaderboard = async (req, res) => {
  try {
    const { period = "all", limit = 10, role } = req.query;

    // Period এর জন্য date query
    let dateQuery = {};
    const now = new Date();

    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateQuery = { createdAt: { $gte: startOfDay } };
    } else if (period === "week") {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateQuery = { createdAt: { $gte: startOfWeek } };
    } else if (period === "month") {
      const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateQuery = { createdAt: { $gte: startOfMonth } };
    }

    // Role filter
    const roleFilter = role ? { userRole: role } : {};

    // Aggregate leaderboard
    const leaderboard = await ReferralChain.aggregate([
      {
        $match: {
          ...roleFilter,
          ...dateQuery,
        },
      },
      {
        $group: {
          _id: "$directReferrer.userId",
          referralCode: { $first: "$directReferrer.referralCode" },
          role: { $first: "$directReferrer.role" },
          totalReferrals: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null },
        },
      },
      {
        $sort: { totalReferrals: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    // Get bonus earned for each user
    const leaderboardWithBonus = await Promise.all(
      leaderboard.map(async (item) => {
        const bonusStats = await BonusTransaction.aggregate([
          {
            $match: {
              bonusDeductedFrom: item._id,
              transactionType: {
                $in: ["referral_bonus", "level1_bonus", "level2_bonus", "level3_bonus"],
              },
              status: "completed",
              ...dateQuery,
            },
          },
          {
            $group: {
              _id: null,
              totalBonus: { $sum: "$bonusAmount" },
            },
          },
        ]);

        return {
          userId: item._id,
          referralCode: item.referralCode,
          role: item.role,
          totalReferrals: item.totalReferrals,
          totalBonusEarned: bonusStats[0]?.totalBonus || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "লিডারবোর্ড পাওয়া গেছে",
      data: {
        period,
        leaderboard: leaderboardWithBonus,
      },
    });
  } catch (error) {
    console.error("Error in getReferralLeaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "লিডারবোর্ড পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * রেফারেল কোড দিয়ে রেজিস্ট্রেশন করা
 * POST /api/referral/register-with-code
 */
exports.registerWithReferralCode = async (req, res) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({
        success: false,
        message: "userId এবং referralCode প্রয়োজন",
      });
    }

    // Referral code verify করা (admin/subAdmin/affiliate/user সব role)
    const referrer = await findReferrerByReferralCode(referralCode);
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: "রেফারেল কোড সঠিক নয়",
      });
    }

    // User এর referredBy আপডেট করা
    await User.findOneAndUpdate(
      { userId },
      { $set: { referredBy: referrer.userId } }
    );

    // Referral chain তৈরি করা
    const referralChain = await createOrUpdateReferralChain(userId);

    // Referrer এর referral count আপডেট করা
    await ReferralChain.findOneAndUpdate(
      { userId: referrer.userId },
      {
        $inc: { totalDirectReferrals: 1 },
      }
    );

    return res.status(200).json({
      success: true,
      message: "রেফারেল কোড সফলভাবে প্রয়োগ হয়েছে",
      data: {
        referralChain,
        referrer: {
          userId: referrer.userId,
          referralCode: referrer.referralCode,
          role: referrer.role,
        },
      },
    });
  } catch (error) {
    console.error("Error in registerWithReferralCode:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল কোড প্রয়োগ করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * Referral chain rebuild করা (bulk operation for admin)
 * POST /api/referral/rebuild-all
 */
exports.rebuildAllReferralChains = async (req, res) => {
  try {
    // Admin only চেক করুন প্রোডাকশনে

    const users = await User.find({}).select("userId").lean();
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const user of users) {
      try {
        await createOrUpdateReferralChain(user.userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user.userId,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "রেফারেল চেইন রিবিল্ড সম্পন্ন হয়েছে",
      data: results,
    });
  } catch (error) {
    console.error("Error in rebuildAllReferralChains:", error);
    return res.status(500).json({
      success: false,
      message: "রেফারেল চেইন রিবিল্ড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = exports;
