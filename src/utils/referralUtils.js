const SubAdmin = require("../models/SubAdminModel");
const AffiliateModel = require("../models/AffiliateModel");
const AdminModel = require("../models/AdminModel");
const User = require("../models/User");

// ✅ ইউজার সাথে রেফারেল লেভেল পান
const getUserWithReferralLevels = async (userId) => {
    let user = await User.findOne({ userId: userId });
    if (!user) return null;

    const levelOneReferrals = await User.find({ referredBy: user.referralCode });
    let levelTwoReferrals = [];
    let levelThreeReferrals = [];

    for (const lvl1 of levelOneReferrals) {
        const lvl2 = await User.find({ referredBy: lvl1.referralCode });
        levelTwoReferrals = levelTwoReferrals.concat(lvl2);
        
        for (const lvl2User of lvl2) {
            const lvl3 = await User.find({ referredBy: lvl2User.referralCode });
            levelThreeReferrals = levelThreeReferrals.concat(lvl3);
        }
    }

    return {
        ...user.toObject(),
        levelOneReferrals,
        levelTwoReferrals,
        levelThreeReferrals,
    };
};

// ✅ রেফারেল মালিক খুঁজে বের করুন (সাব-এডমিন / এফিলিয়েট / এডমিন)
const getReferralOwner = async (referralCode) => {
    if (!referralCode) return null;

    // প্রথমে সাব-এডমিন চেক করুন
    const subAdmin = await SubAdmin.findOne({ referralCode });
    if (subAdmin) {
        return { 
            owner: subAdmin, 
            role: "subadmin", 
            referralCode: subAdmin.referralCode 
        };
    }

    // তারপর এফিলিয়েট চেক করুন
    const affiliate = await AffiliateModel.findOne({ referralCode });
    if (affiliate) {
        let subAdminOwner = null;
        if (affiliate.referredBy) {
            subAdminOwner = await SubAdmin.findOne({ referralCode: affiliate.referredBy });
        }
        return { 
            owner: affiliate, 
            subAdmin: subAdminOwner, 
            role: "affiliate", 
            referralCode: affiliate.referralCode 
        };
    }

    // শেষে এডমিন চেক করুন
    const admin = await AdminModel.findOne({ referralCode });
    if (admin) {
        return { 
            owner: admin, 
            role: "admin", 
            referralCode: admin.referralCode 
        };
    }

    return null;
};

module.exports = { getUserWithReferralLevels, getReferralOwner };