// Dashboard Analytics Controller - Advanced Level
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');
const Withdrawal = require('../models/Withdrawal');
const Deposit = require('../models/Deposit');
const moment = require('moment-timezone');
const asyncHandler = require('express-async-handler');

class DashboardAnalyticsController {
  // Get comprehensive dashboard metrics
  getDashboardMetrics = asyncHandler(async (req, res) => {
    const { startDate, endDate, timeZone = 'UTC' } = req.query;

    const dateRange = this.getDateRange(startDate, endDate, timeZone);

    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      totalBets,
      totalDeposits,
      totalWithdrawals,
      totalWinnings,
      pendingTransactions,
      uniqueDateTransactions,
      topPlayers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: this.getLast24Hours() } }),
      this.calculateTotalRevenue(dateRange),
      Bet.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Deposit.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Withdrawal.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      this.calculateTotalWinnings(dateRange),
      Transaction.countDocuments({ status: 'pending' }),
      this.getUniqueTransactionDates(dateRange),
      this.getTopPlayers(dateRange)
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers,
          totalRevenue,
          totalBets,
          totalDeposits,
          totalWithdrawals,
          totalWinnings,
          pendingTransactions,
          conversionRate: totalUsers > 0 ? ((totalDeposits / totalUsers) * 100).toFixed(2) : 0
        },
        topPlayers,
        dateRange,
        timestamp: new Date()
      }
    });
  });

  // Get time-series data for charts
  getTimeSeriesData = asyncHandler(async (req, res) => {
    const { startDate, endDate, interval = 'daily', timeZone = 'UTC', metric = 'revenue' } = req.query;
    
    const dateRange = this.getDateRange(startDate, endDate, timeZone);
    const timeSeriesData = await this.generateTimeSeries(dateRange, interval, metric);

    res.status(200).json({
      success: true,
      data: {
        labels: timeSeriesData.map(item => item.date),
        datasets: [{
          label: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Over Time`,
          data: timeSeriesData.map(item => item.value),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4,
          fill: true
        }],
        timeZone
      }
    });
  });

  // Get revenue breakdown by source
  getRevenueBreakdown = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        labels: breakdown.map(item => item._id || 'Unknown'),
        datasets: [{
          data: breakdown.map(item => item.amount),
          backgroundColor: [
            '#0dcaf0', '#0d6efd', '#6f42c1', '#fd7e14', '#198754'
          ]
        }],
        summary: breakdown
      }
    });
  });

  // Get user statistics
  getUserStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const [
      newUsers,
      activeUsers,
      inactiveUsers,
      vipUsers,
      usersByCountry,
      usersByStatus
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      User.countDocuments({ lastLoginAt: { $gte: this.getLast7Days() } }),
      User.countDocuments({ lastLoginAt: { $lt: this.getLast30Days() } }),
      User.countDocuments({ tier: { $in: ['VIP', 'Premium'] } }),
      this.getUsersByCountry(),
      this.getUsersByStatus()
    ]);

    res.status(200).json({
      success: true,
      data: {
        newUsers,
        activeUsers,
        inactiveUsers,
        vipUsers,
        usersByCountry,
        usersByStatus,
        totalUsers: await User.countDocuments(),
        engagementRate: ((activeUsers / (await User.countDocuments())) * 100).toFixed(2)
      }
    });
  });

  // Get betting statistics
  getBettingStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const [
      totalBets,
      winningBets,
      losingBets,
      totalBetAmount,
      totalWinnings,
      avgOdds,
      betsByGame
    ] = await Promise.all([
      Bet.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Bet.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'won' }),
      Bet.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'lost' }),
      this.calculateBetAmount(dateRange),
      this.calculateBetWinnings(dateRange),
      this.calculateAverageOdds(dateRange),
      this.getBetsByGame(dateRange)
    ]);

    const winRate = totalBets > 0 ? ((winningBets / totalBets) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBets,
        winningBets,
        losingBets,
        totalBetAmount,
        totalWinnings,
        winRate,
        avgOdds,
        roi: totalBetAmount > 0 ? (((totalWinnings - totalBetAmount) / totalBetAmount) * 100).toFixed(2) : 0,
        betsByGame,
        profitMargin: (totalWinnings - totalBetAmount).toFixed(2)
      }
    });
  });

  // Get transaction flow analysis
  getTransactionFlow = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const [
      deposits,
      withdrawals,
      pendingTransactions,
      failedTransactions,
      successfulTransactions,
      topPaymentMethods
    ] = await Promise.all([
      this.getDepositStats(dateRange),
      this.getWithdrawalStats(dateRange),
      Transaction.countDocuments({ status: 'pending', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Transaction.countDocuments({ status: 'failed', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Transaction.countDocuments({ status: 'completed', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      this.getTopPaymentMethods(dateRange)
    ]);

    res.status(200).json({
      success: true,
      data: {
        deposits,
        withdrawals,
        pending: pendingTransactions,
        failed: failedTransactions,
        successful: successfulTransactions,
        successRate: (successfulTransactions + pendingTransactions + failedTransactions) > 0 
          ? ((successfulTransactions / (successfulTransactions + failedTransactions)) * 100).toFixed(2) 
          : 0,
        topPaymentMethods,
        netFlow: (deposits.total - withdrawals.total).toFixed(2)
      }
    });
  });

  // Get performance metrics
  getPerformanceMetrics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const metrics = {
      avgSessionDuration: await this.getAvgSessionDuration(dateRange),
      userRetention: await this.getUserRetention(dateRange),
      churnRate: await this.getChurnRate(dateRange),
      customerLifetimeValue: await this.getCustomerLifetimeValue(dateRange),
      repeatCustomerRate: await this.getRepeatCustomerRate(dateRange),
      avgDepositPerUser: await this.getAvgDepositPerUser(dateRange),
      avgBetSize: await this.getAvgBetSize(dateRange)
    };

    res.status(200).json({
      success: true,
      data: metrics
    });
  });

  // Get affiliate performance
  getAffiliatePerformance = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const affiliateData = await User.aggregate([
      {
        $match: {
          role: 'affiliate',
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'affiliateId',
          as: 'affiliateTransactions'
        }
      },
      {
        $group: {
          _id: '$_id',
          affiliateName: { $first: '$username' },
          referrals: { $sum: 1 },
          totalEarnings: { $sum: '$affiliateEarnings' },
          totalTransactions: { $size: '$affiliateTransactions' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topAffiliates: affiliateData,
        totalAffiliates: await User.countDocuments({ role: 'affiliate' }),
        totalAffiliateEarnings: await this.getTotalAffiliateEarnings(dateRange)
      }
    });
  });

  // Get real-time dashboard updates
  getRealtimeUpdates = asyncHandler(async (req, res) => {
    const realtimeData = {
      onlineUsers: await this.getOnlineUsers(),
      activeBets: await Bet.countDocuments({ status: 'active' }),
      pendingWithdrawals: await Withdrawal.countDocuments({ status: 'pending' }),
      recentTransactions: await this.getRecentTransactions(10),
      systemStatus: this.getSystemStatus(),
      lastUpdate: new Date()
    };

    res.status(200).json({
      success: true,
      data: realtimeData
    });
  });

  // Export dashboard data
  exportDashboardData = asyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const dateRange = this.getDateRange(startDate, endDate);

    const data = {
      metrics: await this.getDashboardMetricsData(dateRange),
      transactions: await this.getTransactionsForExport(dateRange),
      users: await this.getUsersForExport(dateRange),
      bets: await this.getBetsForExport(dateRange),
      exportDate: new Date(),
      dateRange
    };

    if (format === 'csv') {
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
      // Convert to CSV format
      res.send(this.convertToCSV(data));
    } else {
      res.json({
        success: true,
        data
      });
    }
  });

  // Helper methods

  getDateRange(startDate, endDate, timeZone = 'UTC') {
    const start = startDate ? moment.tz(startDate, timeZone).startOf('day').toDate() : moment.tz(timeZone).subtract(30, 'days').startOf('day').toDate();
    const end = endDate ? moment.tz(endDate, timeZone).endOf('day').toDate() : moment.tz(timeZone).endOf('day').toDate();
    return { start, end };
  }

  getLast24Hours() {
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  getLast7Days() {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  getLast30Days() {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  async calculateTotalRevenue(dateRange) {
    const result = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'completed',
          type: 'revenue'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async calculateTotalWinnings(dateRange) {
    const result = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'won'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$winnings' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getUniqueTransactionDates(dateRange) {
    const result = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        }
      }
    ]);
    return result.length;
  }

  async getTopPlayers(dateRange, limit = 5) {
    return await User.aggregate([
      {
        $lookup: {
          from: 'bets',
          localField: '_id',
          foreignField: 'userId',
          as: 'userBets'
        }
      },
      {
        $addFields: {
          totalBets: { $size: '$userBets' },
          totalWinnings: {
            $sum: {
              $cond: [{ $eq: ['$userBets.status', 'won'] }, '$userBets.winnings', 0]
            }
          }
        }
      },
      {
        $sort: { totalWinnings: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          username: 1,
          totalBets: 1,
          totalWinnings: 1,
          email: 1
        }
      }
    ]);
  }

  async generateTimeSeries(dateRange, interval = 'daily', metric = 'revenue') {
    const timeSeries = [];
    const current = moment(dateRange.start);
    const end = moment(dateRange.end);

    while (current.isBefore(end)) {
      const periodStart = current.clone().toDate();
      const periodEnd = current.clone().add(1, interval).toDate();

      let value = 0;
      if (metric === 'revenue') {
        const result = await Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: periodStart, $lte: periodEnd },
              status: 'completed'
            }
          },
          {
            $group: { _id: null, total: { $sum: '$amount' } }
          }
        ]);
        value = result[0]?.total || 0;
      }

      timeSeries.push({
        date: current.format('YYYY-MM-DD'),
        value
      });

      current.add(1, interval);
    }

    return timeSeries;
  }

  async getUsersByCountry() {
    return await User.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getUsersByStatus() {
    return await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async calculateBetAmount(dateRange) {
    const result = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async calculateBetWinnings(dateRange) {
    const result = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'won'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$winnings' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async calculateAverageOdds(dateRange) {
    const result = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          avgOdds: { $avg: '$odds' }
        }
      }
    ]);
    return result[0]?.avgOdds || 0;
  }

  async getBetsByGame(dateRange) {
    return await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$game',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getDepositStats(dateRange) {
    const result = await Deposit.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    return result[0] || { count: 0, total: 0 };
  }

  async getWithdrawalStats(dateRange) {
    const result = await Withdrawal.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    return result[0] || { count: 0, total: 0 };
  }

  async getTopPaymentMethods(dateRange) {
    return await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);
  }

  async getOnlineUsers() {
    return await User.countDocuments({
      lastActivityAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
  }

  async getRecentTransactions(limit = 10) {
    return await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  getSystemStatus() {
    return {
      database: 'connected',
      cache: 'active',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  async getAvgSessionDuration(dateRange) {
    const result = await User.aggregate([
      {
        $match: {
          lastLoginAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$sessionDuration' }
        }
      }
    ]);
    return result[0]?.avgDuration || 0;
  }

  async getUserRetention(dateRange) {
    // Logic for calculating retention rate
    return 0;
  }

  async getChurnRate(dateRange) {
    // Logic for calculating churn rate
    return 0;
  }

  async getCustomerLifetimeValue(dateRange) {
    const result = await User.aggregate([
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions'
        }
      },
      {
        $group: {
          _id: null,
          avgLTV: {
            $avg: {
              $sum: '$transactions.amount'
            }
          }
        }
      }
    ]);
    return result[0]?.avgLTV || 0;
  }

  async getRepeatCustomerRate(dateRange) {
    // Logic for repeat customer rate
    return 0;
  }

  async getAvgDepositPerUser(dateRange) {
    const result = await Deposit.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$userId',
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: null,
          avgDeposit: { $avg: '$total' }
        }
      }
    ]);
    return result[0]?.avgDeposit || 0;
  }

  async getAvgBetSize(dateRange) {
    const result = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          avgBet: { $avg: '$amount' }
        }
      }
    ]);
    return result[0]?.avgBet || 0;
  }

  async getTotalAffiliateEarnings(dateRange) {
    const result = await User.aggregate([
      {
        $match: {
          role: 'affiliate',
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$affiliateEarnings' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getDashboardMetricsData(dateRange) {
    // Collect all metrics data
    return {};
  }

  async getTransactionsForExport(dateRange) {
    return await Transaction.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    }).lean();
  }

  async getUsersForExport(dateRange) {
    return await User.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    }).lean();
  }

  async getBetsForExport(dateRange) {
    return await Bet.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    }).lean();
  }

  convertToCSV(data) {
    // Convert data to CSV format
    return '';
  }
}

module.exports = new DashboardAnalyticsController();
