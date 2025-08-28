const cron = require('node-cron');
const vipService = require('../Models/VipService');
const UserVip = require('../Models/UserVip');
const VipLevel = require('../Models/VipLevel');
const { default: mongoose } = require('mongoose');
// const logger = require('../utils/logger');
const moment = require('moment');
const BettingHistory = require('../Models/BettingHistory');
// Run at 00:01 on the first day of every month

// logger.info('Starting monthly VIP update...');


const calculateMonthlyTurnover = async (userId) => {
  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const result = await BettingHistory.aggregate([
    {
      $match: {
        member: userId,
        start_time: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalTurnover: { $sum: "$turnover" }
      }
    }
  ]);
  console.log(result);
  return result[0]?.totalTurnover || 0;
}




const updateUserVipStatus = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
console.log('Update VIP status for user:', userId);
  try {
    const userVip = await UserVip.findOne({ userId }).populate('currentLevel').session(session);
    if (!userVip) throw new Error('VIP data not found');

    // Calculate VIP points from turnover
    const turnover = await calculateMonthlyTurnover(userId);
    const vipPointsEarned = turnover / userVip.currentLevel.vpConversionRate;

    // Update VIP points
    if (vipPointsEarned > 0) {
      userVip.vipPoints += vipPointsEarned;

      // Record transaction
      const VipPointTransaction = new VipPointTransaction({
        userId,
        type: 'earned',
        amount: vipPointsEarned,
        description: `VIP points earned from $${turnover} turnover`,
        balanceAfter: userVip.vipPoints
      });
      await VipPointTransaction.save({ session });
    }

    // Check for level upgrade
    const vipLevels = await VipLevel.find().sort({ levelOrder: 1 }).session(session);
    const currentLevelIndex = vipLevels.findIndex(lvl => lvl._id.equals(userVip.currentLevel._id));
// console.log('Current level index:', currentLevelIndex);
console.log('User VIP:', userVip);
    if (currentLevelIndex < vipLevels.length - 1) {
      const nextLevel = vipLevels[currentLevelIndex + 1];
      if (userVip.monthlyTurnover >= nextLevel.monthlyTurnoverRequirement) {
        userVip.currentLevel = nextLevel._id;
        userVip.lastLevelUpdateDate = new Date();
      }
    }

    // Reset monthly turnover
    userVip.lastMonthTurnover = userVip.monthlyTurnover;
    userVip.monthlyTurnover = 0;
    userVip.updatedAt = new Date();
// console.log('Updated user VIP:', userVip);
    await userVip.save({ session });
    await session.commitTransaction();

    return userVip;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

const VipUpdate = async () => {
  try {
    const users = await UserVip.find({});
    const totalUsers = users.length;
    let processed = 0;
    let successes = 0;
    let failures = 0;
    
    console.log(`Starting monthly VIP update for ${totalUsers} users...`);
    for (const user of users) {
      try {
        await updateUserVipStatus(user.userId);
        successes++;
      } catch (error) {
        failures++;
        console.log(`VIP update failed for user ${user.userId}: ${error.message}`);
      }
      processed++;

      // Log progress every 10%
      if (processed % Math.ceil(totalUsers / 10) === 0) {
        const progress = Math.round((processed / totalUsers) * 100);
        console.log(`VIP update progress: ${progress}%`);
      }
    }
console.log("processed", processed, "successes", successes, "failures", failures);
    // logger.info(`Monthly VIP update completed. Success: ${successes}, Failures: ${failures}`);
  } catch (error) {
    console.log(`Monthly VIP update failed: ${error.message}`);
  }
};
// logger.info('Monthly VIP update completed.');

cron.schedule('* * * * *', async () => {
  console.log("🏅 Running VIP update...");
  await VipUpdate();
});
module.exports = VipUpdate;