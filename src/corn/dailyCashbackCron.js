const User = require('../Models/User');
const BettingHistory = require('../Models/BettingHistory');

const getCashbackRate = (total, level) => {
  for (let tier of CASHBACK_TIERS) {
    if (total >= tier.minTurnover) return tier[`tier${level}`] || 0;
  }
  return 0;
};

const calculateDailyCashback = async () => {
  const today = new Date();
  today.setHours(22, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const users = await User.find({ referralCode: { $exists: true } });

  for (const user of users) {
    const referrals = [
      { level: 1, ids: user.levelOneReferrals },
      { level: 2, ids: user.levelTwoReferrals },
      { level: 3, ids: user.levelThreeReferrals }
    ];

    let totalCashback = 0;

    for (const { level, ids } of referrals) {
      if (!ids || ids.length === 0) continue;

      const bets = await BettingHistory.aggregate([
        { $match: { member: { $in: ids }, start_time: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, totalTurnover: { $sum: "$turnover" } } }
      ]);

      const turnover = bets[0]?.totalTurnover || 0;
      const cashbackRate = getCashbackRate(turnover, level);
      const cashback = turnover * cashbackRate;

      totalCashback += cashback;
    }

    if (totalCashback > 0.01) {
      user.cashReward += totalCashback;
      await user.save();
      console.log(`✅ Cashback ৳${totalCashback.toFixed(2)} given to ${user.userId}`);
    }
  }

  console.log("✅ Daily Cashback Calculation Done");
};

module.exports = calculateDailyCashback;
