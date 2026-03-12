const User = require("../models/User");
const SubAdminModel = require("../models/SubAdminModel");
const AffiliateModel = require("../models/AffiliateModel");
const AdminModel = require("../models/AdminModel");
const ReferralChain = require("../models/ReferralChain");
const Gateway = require("../models/Gateway");

/**
 * রেফারেল চেইন ইউটিলিটি ফাংশনস
 * এই ফাংশনগুলো দিয়ে রেফারেল হায়ারার্কি ম্যানেজ করা হবে
 */

/**
 * ইউজারের রোল এবং ডিটেইলস খুঁজে বের করা
 */
async function getUserRoleAndDetails(userId) {
  try {
    // প্রথমে User collection এ খুঁজি
    let user = await User.findOne({ userId });
    if (user) {
      return {
        userId: user.userId,
        role: user.role || "user",
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        hasGateway: false, // Normal users don't have gateway
      };
    }

    // Admin খুঁজি
    let admin = await AdminModel.findOne({ userId });
    if (admin) {
      const hasGateway = await Gateway.exists({
        ownerId: admin.userId,
        isActive: true,
      });
      return {
        userId: admin.userId,
        role: "admin",
        referralCode: admin.referralCode || "1",
        referredBy: null,
        hasGateway: !!hasGateway,
      };
    }

    // SubAdmin খুঁজি
    let subAdmin = await SubAdminModel.findOne({ userId });
    if (subAdmin) {
      const hasGateway = await Gateway.exists({
        ownerId: subAdmin.userId,
        isActive: true,
      });
      return {
        userId: subAdmin.userId,
        role: "subAdmin",
        referralCode: subAdmin.referralCode,
        referredBy: subAdmin.referredBy,
        hasGateway: !!hasGateway,
      };
    }

    // Affiliate খুঁজি
    let affiliate = await AffiliateModel.findOne({ userId });
    if (affiliate) {
      const hasGateway = await Gateway.exists({
        ownerId: affiliate.userId,
        isActive: true,
      });
      return {
        userId: affiliate.userId,
        role: "affiliate",
        referralCode: affiliate.referralCode,
        referredBy: affiliate.referredBy,
        hasGateway: !!hasGateway,
      };
    }

    return null;
  } catch (error) {
    console.error("Error in getUserRoleAndDetails:", error);
    return null;
  }
}

/**
 * পুরো রেফারেল চেইন তৈরি করা (নিচ থেকে উপরে)
 */
async function buildReferralChain(userId) {
  try {
    const chain = [];
    let currentUserId = userId;
    let level = 0;
    const maxLevels = 10; // সেফটির জন্য ম্যাক্সিমাম লেভেল

    while (currentUserId && level < maxLevels) {
      const userDetails = await getUserRoleAndDetails(currentUserId);

      if (!userDetails) {
        break;
      }

      chain.push({
        userId: userDetails.userId,
        role: userDetails.role,
        referralCode: userDetails.referralCode,
        level: level,
        hasGateway: userDetails.hasGateway,
      });

      // যদি Admin হয় বা referredBy না থাকে তাহলে চেইন শেষ
      if (
        userDetails.role === "admin" ||
        !userDetails.referredBy ||
        userDetails.referredBy === "1"
      ) {
        break;
      }

      currentUserId = userDetails.referredBy;
      level++;
    }

    return chain;
  } catch (error) {
    console.error("Error in buildReferralChain:", error);
    return [];
  }
}

/**
 * গেটওয়ে ওনার খুঁজে বের করা
 * নিয়ম: চেইনে উপরে যেতে থাকব যতক্ষণ না গেটওয়ে ওয়ালা কাউকে পাই
 */
function findGatewayOwner(chain) {
  // চেইনের প্রথম থেকে (নিচ থেকে) শুরু করে উপরে যাব
  for (const node of chain) {
    if (node.hasGateway) {
      return {
        userId: node.userId,
        role: node.role,
        referralCode: node.referralCode,
      };
    }
  }

  // যদি কেউ না পাওয়া যায়, তাহলে সবার শেষে (top level) যে আছে তাকে রিটার্ন করব
  const topNode = chain[chain.length - 1];
  return topNode
    ? {
        userId: topNode.userId,
        role: topNode.role,
        referralCode: topNode.referralCode,
      }
    : null;
}

/**
 * বোনাস ডিডাকশন ওনার খুঁজে বের করা
 * নিয়ম:
 * - যদি direct referrer Affiliate হয়, তাহলে তার থেকে কাটা হবে
 * - যদি direct referrer Admin/SubAdmin হয়, তাহলে তার থেকে কাটা হবে
 * - নাহলে উপরে যেতে থাকব affiliate/admin/subadmin পাওয়া পর্যন্ত
 */
function findBonusDeductionOwner(chain) {
  // Direct referrer (chain[1]) চেক করি
  if (chain.length > 1) {
    const directReferrer = chain[1];
    if (
      directReferrer.role === "affiliate" ||
      directReferrer.role === "subAdmin" ||
      directReferrer.role === "admin"
    ) {
      return {
        userId: directReferrer.userId,
        role: directReferrer.role,
        referralCode: directReferrer.referralCode,
      };
    }
  }

  // চেইনে উপরে গিয়ে affiliate/subAdmin/admin খুঁজি
  for (let i = 2; i < chain.length; i++) {
    const node = chain[i];
    if (
      node.role === "affiliate" ||
      node.role === "subAdmin" ||
      node.role === "admin"
    ) {
      return {
        userId: node.userId,
        role: node.role,
        referralCode: node.referralCode,
      };
    }
  }

  // শেষে admin পাওয়া যাবেই
  const topNode = chain[chain.length - 1];
  return topNode
    ? {
        userId: topNode.userId,
        role: topNode.role,
        referralCode: topNode.referralCode,
      }
    : null;
}

/**
 * Admin, SubAdmin, Affiliate খুঁজে বের করা চেইন থেকে
 */
function extractHierarchyIds(chain) {
  const hierarchy = {
    adminId: null,
    subAdminId: null,
    affiliateId: null,
  };

  for (const node of chain) {
    if (node.role === "admin" && !hierarchy.adminId) {
      hierarchy.adminId = node.userId;
    } else if (node.role === "subAdmin" && !hierarchy.subAdminId) {
      hierarchy.subAdminId = node.userId;
    } else if (node.role === "affiliate" && !hierarchy.affiliateId) {
      hierarchy.affiliateId = node.userId;
    }
  }

  return hierarchy;
}

/**
 * ReferralChain ডকুমেন্ট তৈরি বা আপডেট করা
 */
async function createOrUpdateReferralChain(userId) {
  try {
    // ইউজারের ডিটেইলস নিয়ে আসি
    const userDetails = await getUserRoleAndDetails(userId);
    if (!userDetails) {
      throw new Error(`User not found: ${userId}`);
    }

    // পুরো চেইন তৈরি করি
    const fullChain = await buildReferralChain(userId);

    // Gateway owner খুঁজি
    const gatewayOwner = findGatewayOwner(fullChain);

    // Bonus deduction owner খুঁজি
    const bonusDeductionOwner = findBonusDeductionOwner(fullChain);

    // Direct referrer নিয়ে আসি
    const directReferrer =
      fullChain.length > 1
        ? {
            userId: fullChain[1].userId,
            role: fullChain[1].role,
            referralCode: fullChain[1].referralCode,
            hasGateway: fullChain[1].hasGateway,
          }
        : null;

    // Hierarchy IDs extract করি
    const hierarchy = extractHierarchyIds(fullChain);

    // ReferralChain ডকুমেন্ট তৈরি বা আপডেট করি
    const referralChainData = {
      userId: userDetails.userId,
      referralCode: userDetails.referralCode,
      directReferrer,
      gatewayOwner,
      bonusDeductionOwner,
      fullChain,
      adminId: hierarchy.adminId,
      subAdminId: hierarchy.subAdminId,
      affiliateId: hierarchy.affiliateId,
      userLevel: fullChain.length - 1,
      userRole: userDetails.role,
      hasOwnGateway: userDetails.hasGateway,
      isActive: true,
    };

    const referralChain = await ReferralChain.findOneAndUpdate(
      { userId: userDetails.userId },
      referralChainData,
      { upsert: true, new: true }
    );

    return referralChain;
  } catch (error) {
    console.error("Error in createOrUpdateReferralChain:", error);
    throw error;
  }
}

/**
 * ইউজারের গেটওয়ে খুঁজে বের করা
 */
async function getUserGateway(userId) {
  try {
    // প্রথমে referral chain নিয়ে আসি
    let referralChain = await ReferralChain.findOne({ userId });

    // যদি না থাকে তাহলে তৈরি করি
    if (!referralChain) {
      referralChain = await createOrUpdateReferralChain(userId);
    }

    // Gateway owner এর গেটওয়ে খুঁজি
    if (referralChain.gatewayOwner) {
      const gateway = await Gateway.findOne({
        ownerId: referralChain.gatewayOwner.userId,
        isActive: true,
      });

      return gateway;
    }

    return null;
  } catch (error) {
    console.error("Error in getUserGateway:", error);
    return null;
  }
}

/**
 * সব গেটওয়ে পাওয়া (gateway owner এর)
 */
async function getAllGatewaysForUser(userId) {
  try {
    let referralChain = await ReferralChain.findOne({ userId });

    if (!referralChain) {
      referralChain = await createOrUpdateReferralChain(userId);
    }

    if (referralChain.gatewayOwner) {
      const gateways = await Gateway.find({
        ownerId: referralChain.gatewayOwner.userId,
        isActive: true,
      });

      return gateways;
    }

    return [];
  } catch (error) {
    console.error("Error in getAllGatewaysForUser:", error);
    return [];
  }
}

/**
 * ইউজারের সব referrals count করা
 */
async function countUserReferrals(userId) {
  try {
    const directReferrals = await ReferralChain.countDocuments({
      "directReferrer.userId": userId,
    });

    const indirectReferrals = await ReferralChain.countDocuments({
      "fullChain.userId": userId,
      userId: { $ne: userId }, // নিজেকে বাদ দিয়ে
      "directReferrer.userId": { $ne: userId }, // direct referral বাদ দিয়ে
    });

    return {
      directReferrals,
      indirectReferrals,
      totalReferrals: directReferrals + indirectReferrals,
    };
  } catch (error) {
    console.error("Error in countUserReferrals:", error);
    return {
      directReferrals: 0,
      indirectReferrals: 0,
      totalReferrals: 0,
    };
  }
}

/**
 * রেফারেল কোড দিয়ে রেফারার খুঁজে বের করা (সব role জুড়ে)
 */
async function findReferrerByReferralCode(referralCode) {
  const normalizedCode = String(referralCode || "").trim();
  if (!normalizedCode) return null;

  // Admin বিশেষ কেস: referralCode = 1
  if (normalizedCode === "1") {
    const adminByCode = await AdminModel.findOne({ referralCode: "1" });
    if (adminByCode) {
      return {
        userId: adminByCode.userId,
        role: "admin",
        referralCode: "1",
      };
    }

    // fallback: প্রথম admin
    const anyAdmin = await AdminModel.findOne({}).sort({ createdAt: 1 });
    if (anyAdmin) {
      return {
        userId: anyAdmin.userId,
        role: "admin",
        referralCode: anyAdmin.referralCode || "1",
      };
    }
  }

  const user = await User.findOne({ referralCode: normalizedCode });
  if (user) {
    return {
      userId: user.userId,
      role: "user",
      referralCode: user.referralCode,
    };
  }

  const affiliate = await AffiliateModel.findOne({ referralCode: normalizedCode });
  if (affiliate) {
    return {
      userId: affiliate.userId,
      role: "affiliate",
      referralCode: affiliate.referralCode,
    };
  }

  const subAdmin = await SubAdminModel.findOne({ referralCode: normalizedCode });
  if (subAdmin) {
    return {
      userId: subAdmin.userId,
      role: "subAdmin",
      referralCode: subAdmin.referralCode,
    };
  }

  const admin = await AdminModel.findOne({ referralCode: normalizedCode });
  if (admin) {
    return {
      userId: admin.userId,
      role: "admin",
      referralCode: admin.referralCode,
    };
  }

  return null;
}

module.exports = {
  getUserRoleAndDetails,
  buildReferralChain,
  findGatewayOwner,
  findBonusDeductionOwner,
  extractHierarchyIds,
  createOrUpdateReferralChain,
  getUserGateway,
  getAllGatewaysForUser,
  countUserReferrals,
  findReferrerByReferralCode,
};
