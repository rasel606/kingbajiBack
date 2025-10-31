// // const User = require("../Models/User");
// // const SubAdmin = require("../Models/SubAdminModel");

// // const AffiliateModel = require("../Models/AffiliateModel");
// // const AdminModel = require("../Models/AdminModel");

// // // ✅ Get user with referral levels
// // const getUserWithReferralLevels = async (userId) => {
// //   const user = await User.findOne({ userId });
// //   if (!user) return null;

// //   const levelOneReferrals = await User.find({ referredBy: user.referralCode });

// //   let levelTwoReferrals = [];
// //   for (const lvl1 of levelOneReferrals) {
// //     const lvl2 = await User.find({ referredBy: lvl1.referralCode });
// //     levelTwoReferrals = levelTwoReferrals.concat(lvl2);
// //   }

// //   let levelThreeReferrals = [];
// //   for (const lvl2 of levelTwoReferrals) {
// //     const lvl3 = await User.find({ referredBy: lvl2.referralCode });
// //     levelThreeReferrals = levelThreeReferrals.concat(lvl3);
// //   }

// //   return {
// //     ...user.toObject(),
// //     levelOneReferrals,
// //     levelTwoReferrals,
// //     levelThreeReferrals,
// //   };
// // };

// // // ✅ Get referral owner (SubAdmin / Affiliate / Admin)
// // const getReferralOwner = async (referralCode) => {
// //     console.log("referralCode", referralCode);
// // //   if (!referralCode) return null;

// //   const subAdmin = await SubAdmin.findOne({ referralCode });
// //   if (subAdmin) {
// //     return { owner: subAdmin, role: "subadmin", referralCode: subAdmin.referralCode };
// //   }

// //   const affiliate = await AffiliateModel.findOne({ referralCode });
// //   if (affiliate) {
// //     let subAdminOwner = null;
// //     if (affiliate.referredBy) {
// //       subAdminOwner = await SubAdmin.findOne({ referralCode: affiliate.referredBy });
// //     }
// //     return { owner: affiliate, subAdmin: subAdminOwner, role: "affiliate", referralCode: affiliate.referralCode };
// //   }

// //   const admin = await AdminModel.findOne({ referredCode: null });
// //   if (admin) {
// //     return { owner: admin, role: "admin", referralCode: admin.referralCode };
// //   }

// //   return null;
// // };


// // module.exports = { getUserWithReferralLevels, getReferralOwner };


// const User = require("../Models/User");
// const SubAdmin = require("../Models/SubAdminModel");
// const AffiliateModel = require("../Models/AffiliateModel");
// const AdminModel = require("../Models/AdminModel");


// // 🔹 Recursive builder for Affiliates + Users under SubAdmin
// const buildAffiliateHierarchy = async (affiliate) => {
//   const users = await User.find({ referredBy: affiliate.referralCode });

//   return {
//     ...affiliate.toObject(),
//     role: "affiliate",
//     users,
//   };
// };


// // 🔹 Recursive builder for SubAdmins → Affiliates → Users
// const buildSubAdminHierarchy = async (subAdmin) => {
//   const affiliates = await AffiliateModel.find({ referredBy: subAdmin.referralCode });

//   const affiliateTrees = [];
//   for (const aff of affiliates) {
//     affiliateTrees.push(await buildAffiliateHierarchy(aff));
//   }

//   return {
//     ...subAdmin.toObject(),
//     role: "subadmin",
//     affiliates: affiliateTrees,
//   };
// };


// // ✅ Get referral owner with full hierarchy (Admin → SubAdmin → Affiliate → Users)
// const getReferralOwner = async (referralCode) => {
//   let owner = null;
//   let role = "admin";

//   // 🟢 No referral → Admin
//   if (!referralCode) {
//     owner = await AdminModel.findOne({});
//   } else {
//     // Check SubAdmin
//     const subAdmin = await SubAdmin.findOne({ referralCode });
//     if (subAdmin) {
//       owner = subAdmin;
//       role = "subadmin";
//     }

//     // Check Affiliate
//     const affiliate = await AffiliateModel.findOne({ referralCode });
//     if (affiliate) {
//       owner = affiliate;
//       role = "affiliate";
//     }
//   }

//   if (!owner) {
//     owner = await AdminModel.findOne({});
//     role = "admin";
//   }

//   // 🔹 Build hierarchy depending on role
//   if (role === "admin") {
//     const subAdmins = await SubAdmin.find({});
//     const subAdminTrees = [];
//     for (const sa of subAdmins) {
//       subAdminTrees.push(await buildSubAdminHierarchy(sa));
//     }
//     return {
//       ...owner.toObject(),
//       role: "admin",
//       subAdmins: subAdminTrees,
//     };
//   }

//   if (role === "subadmin") {
//     return await buildSubAdminHierarchy(owner);
//   }

//   if (role === "affiliate") {
//     return await buildAffiliateHierarchy(owner);
//   }

//   return null;
// };


// // ✅ User referral tree (previous code kept)
// const buildReferralTree = async (user, level, maxLevel) => {
//   if (level > maxLevel) return [];

//   const referrals = await User.find({ referredBy: user.referralCode });

//   const referralTree = [];
//   for (const referral of referrals) {
//     const childTree = await buildReferralTree(referral, level + 1, maxLevel);
//     referralTree.push({
//       ...referral.toObject(),
//       referrals: childTree,
//     });
//   }

//   return referralTree;
// };

// const getUserWithReferralLevels = async (userId, maxLevel = 3) => {
//   const user = await User.findOne({ userId });
//   if (!user) return null;

//   const nestedReferrals = await buildReferralTree(user, 1, maxLevel);

//   return {
//     ...user.toObject(),
//     referrals: nestedReferrals,
//   };
// };

// const getUserReferralTree = async (userId, maxLevel = 3) => {
//   const userTree = await getUserWithReferralLevels(userId, maxLevel);
//   if (!userTree) throw new Error("User not found");

//   const ownerChain = await getReferralOwner(userTree.referredBy);

//   return { userTree, ownerChain };
// };


// module.exports = {
//   getUserWithReferralLevels,
//   getReferralOwner,
//   getUserReferralTree,
// };








const User = require("../Models/User");
const SubAdmin = require("../Models/SubAdminModel");
const AffiliateModel = require("../Models/AffiliateModel");
const AdminModel = require("../Models/AdminModel");

/**
 * ✅ Reusable Referral Data Fetcher
 * Supports: admin | subAdmin | affiliate | user
 */
const getReferralData = async (role, filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = {} } = options;
  const skip = (page - 1) * limit;

  let Model;
  let pipeline = [];

  switch (role) {
    case "user":
      Model = User;
      pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "affiliatemodels",
            localField: "referredBy",
            foreignField: "referralCode",
            as: "affiliateInfo",
          },
        },
        {
          $lookup: {
            from: "subadmins",
            localField: "referredBy",
            foreignField: "referralCode",
            as: "subAdminInfo",
          },
        },
        {
          $addFields: {
            referredByRole: {
              $cond: [
                { $gt: [{ $size: "$affiliateInfo" }, 0] }, "affiliate",
                { $cond: [{ $gt: [{ $size: "$subAdminInfo" }, 0] }, "subAdmin", "admin"] }
              ]
            },
            referredById: {
              $cond: [
                { $gt: [{ $size: "$affiliateInfo" }, 0] }, { $arrayElemAt: ["$affiliateInfo._id", 0] },
                { $cond: [{ $gt: [{ $size: "$subAdminInfo" }, 0] }, { $arrayElemAt: ["$subAdminInfo._id", 0] }, null] }
              ]
            },
          },
        },
        { $project: { affiliateInfo: 0, subAdminInfo: 0 } },
      ];
      break;

    case "affiliate":
      Model = AffiliateModel;
      pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "subadmins",
            localField: "referredBy",
            foreignField: "referralCode",
            as: "subAdminInfo",
          },
        },
        {
          $addFields: {
            referredByRole: {
              $cond: [{ $gt: [{ $size: "$subAdminInfo" }, 0] }, "subAdmin", "admin"],
            },
            referredById: {
              $cond: [{ $gt: [{ $size: "$subAdminInfo" }, 0] }, { $arrayElemAt: ["$subAdminInfo._id", 0] }, null],
            },
          },
        },
        { $project: { subAdminInfo: 0 } },
      ];
      break;

    case "subAdmin":
      Model = SubAdmin;
      pipeline = [
        { $match: filter },
        { $addFields: { referredByRole: "admin", referredById: null } },
      ];
      break;

    case "admin":
      Model = AdminModel;
      pipeline = [
        { $match: filter },
        { $addFields: { referredByRole: null, referredById: null } },
      ];
      break;

    default:
      throw new Error("❌ Invalid role provided");
  }

  // Pagination + Sorting
  if (Object.keys(sort).length > 0) {
    pipeline.push({ $sort: sort });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } }); // fallback default
  }

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const data = await Model.aggregate(pipeline);
  const total = await Model.countDocuments(filter);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

};

module.exports = { getReferralData };
