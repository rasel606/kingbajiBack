const UserModel = require('../models/User');
const AgentModel = require('../models/AgentModel');
const SubAdminModel = require('../models/SubAdminModel');
const AffiliateModel = require('../models/AffiliateModel');
const TransactionModel = require('../models/TransactionModel');
const BettingHistory = require('../models/BettingHistory');
const BetProviderTable = require('../models/BetProviderTable');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal'); // Adjust if different
const Bonus = require('../models/Bonus');
const VipPointTransaction = require('../models/VipPointTransaction');

class DashboardService {
  /**
   * Get comprehensive advanced dashboard metrics
   */
  static async getAdvancedMetrics(dateRange = null) {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, onlineUsers, totalAgents, totalSubAdmins, totalAffiliates,
      totalDeposits, totalWithdrawals, todayDeposits, todayWithdrawals,
      thisMonthDeposits, lastMonthDeposits, thisMonthWithdrawals, lastMonthWithdrawals,
      thisMonthNewUsers, lastMonthNewUsers, totalBets, totalBettingVolume,
      totalCommissions, totalBonuses, totalVIPPoints,
      topProviders
    ] = await Promise.all([
      // Hierarchy counts
      UserModel.countDocuments({}),
      UserModel.countDocuments({ onlinestatus: { $gte: new Date(Date.now() - 15 * 60 * 1000) } }),
      AgentModel.countDocuments({}),
      SubAdminModel.countDocuments({}),
      AffiliateModel.countDocuments({}),

      // Deposits
      TransactionModel.aggregate([{ $match: { type: 0, status: 1 } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 1, status: 1 } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 0, status: 1, updatetime: { $gte: new Date(now.setHours(0,0,0,0)) } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 1, status: 1, updatetime: { $gte: new Date(now.setHours(0,0,0,0)) } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),

      // Monthly
      TransactionModel.aggregate([{ $match: { type: 0, status: 1, updatetime: { $gte: firstDayThisMonth } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 0, status: 1, updatetime: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 1, status: 1, updatetime: { $gte: firstDayThisMonth } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),
      TransactionModel.aggregate([{ $match: { type: 1, status: 1, updatetime: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } } }, { $group: { _id: null, total: { $sum: '$base_amount' } } }]),

      // Users monthly
      UserModel.countDocuments({ timestamp: { $gte: firstDayThisMonth } }),
      UserModel.countDocuments({ timestamp: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } }),

      // Betting
      BettingHistory.countDocuments({}),
      BettingHistory.aggregate([{ $group: { _id: null, total: { $sum: '$base_amount' } } }]),

      // Financials
      Commission.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Bonus.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      VipPointTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]),

      // Top providers
      BettingHistory.aggregate([
        { $group: { _id: '$provider', bets: { $sum: 1 }, revenue: { $sum: { $subtract: [ '$betAmount', '$winAmount' ] } } } },
        { $lookup: { from: 'betprovidertables', localField: '_id', foreignField: 'providercode', as: 'providerInfo' } },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    const revenue = (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0);
    const profit = revenue - (totalCommissions[0]?.total || 0) - (totalBonuses[0]?.total || 0);

    const growth = {
      depositGrowth: ((thisMonthDeposits[0]?.total || 0) - (lastMonthDeposits[0]?.total || 0)) / (lastMonthDeposits[0]?.total || 1) * 100,
      userGrowth: ((thisMonthNewUsers || 0) - (lastMonthNewUsers || 0)) / (lastMonthNewUsers || 1) * 100,
    };

    return {
      summary: {
        totalUsers, onlineUsers, totalAgents, totalSubAdmins, totalAffiliates,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        revenue: revenue.toFixed(2),
        profit: profit.toFixed(2),
        totalBets,
        bettingVolume: totalBettingVolume[0]?.total || 0,
        totalCommissions: totalCommissions[0]?.total || 0,
        totalBonuses: totalBonuses[0]?.total || 0,
        totalVIPPoints: totalVIPPoints[0]?.total || 0,
        todayDeposits: todayDeposits[0]?.total || 0,
        todayWithdrawals: todayWithdrawals[0]?.total || 0
      },
      growth,
      topProviders,
      timestamp: new Date()
    };
  }

  /**
   * Get realtime stats (for live updates)
   */
  static async getRealtimeStats() {
    const [
      onlineUsers,
      pendingTransactions,
      activeBets
    ] = await Promise.all([
      UserModel.countDocuments({ onlinestatus: { $gte: new Date(Date.now() - 15 * 60 * 1000) } }),
      TransactionModel.countDocuments({ status: 0 }), // pending
      BettingHistory.countDocuments({ status: 'active' }) // adjust field
    ]);

    return {
      onlineUsers,
      pendingTransactions,
      activeBets,
      timestamp: new Date()
    };
  }

  /**
   * Time series data (daily/weekly/monthly)
   */
  static async getTimeSeriesData({ startDate, endDate, interval = 'daily', metric = 'revenue' }) {
    // Implementation for time-series charts (daily revenue, users, etc.)
    // Use $dateToString in aggregate for grouping
    const match = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    // ... aggregate pipeline
    return { labels: [], data: [] }; // placeholder
  }

  /**
   * Provider performance breakdown
   */
  static async getProviderStats() {
    const providers = await BetProviderTable.aggregate([
      { $lookup: {
          from: 'bettinghistory', // adjust collection
          let: { providerCode: '$providercode' },
          pipeline: [{ $match: { $expr: { $eq: ['$provider', '$$providerCode'] } } }],
          as: 'stats'
        }
      },
      { $addFields: {
          totalBets: { $size: '$stats' },
          totalRevenue: { $sum: '$stats.revenue' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    return providers;
  }
}

module.exports = DashboardService;

