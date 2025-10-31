
const SubAdmin = require("../Models/SubAdminModel");

const AffiliateModel = require("../Models/AffiliateModel");
const AdminModel = require("../Models/AdminModel");
const User = require("../Models/User");

// ✅ Get user with referral levels
const getUserWithReferralLevels = async (userId) => {
  console.log(" getUserWithReferralLevels userId", userId);
  let user = await User.findOne({ userId : userId });
  console.log("getUserWithReferralLevels  user", user);
  if (!user) return null;

  const levelOneReferrals = await User.find({ referredBy: user.referralCode });

  let levelTwoReferrals = [];
  for (const lvl1 of levelOneReferrals) {
    const lvl2 = await User.find({ referredBy: lvl1.referralCode });
    levelTwoReferrals = levelTwoReferrals.concat(lvl2);
  }

  let levelThreeReferrals = [];
  for (const lvl2 of levelTwoReferrals) {
    const lvl3 = await User.find({ referredBy: lvl2.referralCode });
    levelThreeReferrals = levelThreeReferrals.concat(lvl3);
  }

  return {
    ...user.toObject(),
    levelOneReferrals,
    levelTwoReferrals,
    levelThreeReferrals,
  };
};

// ✅ Get referral owner (SubAdmin / Affiliate / Admin)
const getReferralOwner = async (referralCode) => {
    console.log("referralCode", referralCode);
//   if (!referralCode) return null;

  const subAdmin = await SubAdmin.findOne({ referralCode });
  if (subAdmin) {
    return { owner: subAdmin, role: "subadmin", referralCode: subAdmin.referralCode };
  }

  const affiliate = await AffiliateModel.findOne({ referralCode });
  if (affiliate) {
    let subAdminOwner = null;
    if (affiliate.referredBy) {
      subAdminOwner = await SubAdmin.findOne({ referralCode: affiliate.referredBy });
    }
    return { owner: affiliate, subAdmin: subAdminOwner, role: "affiliate", referralCode: affiliate.referralCode };
  }

  const admin = await AdminModel.findOne({ referredCode: null });
  if (admin) {
    return { owner: admin, role: "admin", referralCode: admin.referralCode };
  }

  return null;
};


module.exports = { getUserWithReferralLevels, getReferralOwner };
