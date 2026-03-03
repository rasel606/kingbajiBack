const User = require("../Models/User");




const UserBlanceCount = (userId) => {
  // Calculate referral bonuses every day at 00:01 AM

  const user = User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const balanceCount = user.balance + user.cashReward;
  return balanceCount;
 
};

module.exports = UserBlanceCount;