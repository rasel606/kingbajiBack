const cron = require('node-cron');
const DashboardStats = require('../models/DashboardStats');
const User = require('../models/User');
const BettingHistory = require('../models/BettingHistory');

// Update dashboard statistics daily at midnight
const updateDailyStats = async () => {
  try {
    console.log('📊 Updating daily dashboard statistics...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if stats already exist for today
    const existingStats = await DashboardStats.findOne({ date: today });
    if (existingStats) {
      console.log('📊 Today\'s stats already exist, skipping...');
      return;
    }

    // Create new stats
    const stats = new DashboardStats({ date: today });

    // Calculate statistics
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // User Statistics
    stats.totalUsers = await User.countDocuments();
    stats.newUsers = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    stats.activeUsers = await User.countDocuments({
      lastLoginTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Betting Statistics
    const bettingStats = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalTurnover: { $sum: "$turnover" },
          totalPayout: { $sum: "$payout" },
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    if (bettingStats[0]) {
      stats.totalBets = bettingStats[0].totalBets;
      stats.totalTurnover = bettingStats[0].totalTurnover;
      stats.totalPayout = bettingStats[0].totalPayout;
      stats.totalWinLoss = bettingStats[0].totalPayout - bettingStats[0].totalTurnover;
    }

    // Save stats
    await stats.save();
    console.log('✅ Daily stats updated successfully');
  } catch (error) {
    console.error('❌ Failed to update daily stats:', error);
  }
};

// Clean old activity logs (keep only last 90 days)
const cleanOldActivityLogs = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // You'll need to import AdminActivityLog model
    // const result = await AdminActivityLog.deleteMany({
    //   timestamp: { $lt: ninetyDaysAgo }
    // });
    
    // console.log(`🧹 Cleaned ${result.deletedCount} old activity logs`);
  } catch (error) {
    console.error('❌ Failed to clean activity logs:', error);
  }
};

// Schedule jobs
const scheduleAdminJobs = () => {
  // Update stats daily at midnight
  cron.schedule('0 0 * * *', updateDailyStats);
  
  // Clean old logs weekly
  cron.schedule('0 0 * * 0', cleanOldActivityLogs);
  
  console.log('⏰ Admin cron jobs scheduled');
};

module.exports = {
  updateDailyStats,
  cleanOldActivityLogs,
  scheduleAdminJobs
};