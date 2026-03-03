// services/userService.js
const User = require("../Models/User");

/**
 * Get users based on role
 */
const getUsersByRole = async (role, referralCode) => {
  switch (role) {
    case "admin":
      return await User.find({});
    case "subadmin":
      if (!referralCode) throw new Error("Referral code required for subadmin");
      return await User.find({ referredBy: referralCode });
    case "agent":
      if (!referralCode) throw new Error("Referral code required for agent");
      return await User.find({ referredBy: referralCode });
    default:
      throw new Error("Invalid role specified");
  }
};

module.exports = { getUsersByRole };
