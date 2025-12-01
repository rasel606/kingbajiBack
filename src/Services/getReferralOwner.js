
// module.exports = { getUserWithReferralLevels, getReferralOwner };
const SubAdmin = require("../Models/SubAdminModel");
const AffiliateModel = require("../Models/AffiliateModel");
const AdminModel = require("../Models/AdminModel");
const AgentModel = require("../Models/AgentModel");
const SubAgentModel = require("../Models/SubAgentModel");
const User = require("../Models/User");

// ===================================================================
// GET USER WITH REFERRAL LEVELS
// ===================================================================
const getUserWithReferralLevels = async (userId) => {
  console.log(" getUserWithReferralLevels userId", userId);
  let user = await User.findOne({ userId: userId });
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

// ===================================================================
// GET REFERRAL OWNER (Admin / SubAdmin / Affiliate / Agent / SubAgent)
// ===================================================================
const getReferralOwner = async (referralCode) => {
  console.log("referralCode", referralCode);


  const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
  if (subAdmin) {
    return {
      owner: subAdmin,
      role: "subadmin",
      referralCode: subAdmin.referralCode,
      parent: null,
    };
  }
  console.log("referralCode subAdmin", subAdmin);

  const affiliate = await AffiliateModel.findOne({ referralCode: referralCode });
  if (affiliate) {
    const subAdminOwner = affiliate.referredBy
      ? await SubAdmin.findOne({ referralCode: affiliate.referredBy })
      : null;

    return {
      owner: affiliate,
      role: "affiliate",
      referralCode: affiliate.referralCode,
      parent: subAdminOwner,
    };
  }
  console.log("referralCode affiliate", affiliate);

  const agent = await AgentModel.findOne({ referralCode: referralCode });
  if (agent) {
    return {
      owner: agent,
      role: "agent",
      referralCode: agent.referralCode,
    };
  }
  console.log("referralCode agent", agent);

  const subAgent = await SubAgentModel.findOne({ referralCode: referralCode });
  if (subAgent) {

    let parent = null;
    if (subAgent.referredBy) {
      parent = await AgentModel.findOne({ referralCode: subAgent.referredBy })


      return {
        owner: subAgent,
        role: "subagent",
        referralCode: subAgent.referralCode,
        parent,
      };
    }


    const admin = await AdminModel.findOne({ referredBy: null });
    if (admin) {
      return {
        owner: admin,
        role: "admin",
        referralCode: admin.referralCode,
        parent: null,
      };
    }

    return null;
  }
}

  module.exports = { getUserWithReferralLevels, getReferralOwner };
