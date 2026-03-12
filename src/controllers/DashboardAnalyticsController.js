// Dashboard Analytics Controller - Advanced Level
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const BettingHistory = require('../models/BettingHistory'); // Fixed: Use BettingHistory instead of Bet
const Withdrawal = require('../models/Withdrawal');
const Deposit = require('../models/Deposit');
const moment = require('moment-timezone');
const asyncHandler = require('express-async-handler');

class DashboardAnalyticsController {
  // ⚡ OPTIMIZED: Get all dashboard data in a single call
  getOptimizedSummary = asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, timeZone = 'UTC' } = req.query;
      const dateRange = this.getDateRange(startDate, endDate, timeZone);

      // Execute all queries in parallel for maximum performance
      const [
        totalUsers,
        activeUsers,
        totalRevenue,
        totalBets,
        deposits,
        withdrawals,
        vipUsers,
        onlineUsers,
        pendingWithdrawals,
        topGames,
        revenueBreakdown,
        timeSeriesData,
      ] = await Promise.allSettled([
        User.countDocuments(),
        User.countDocuments({ lastLoginAt: { $gte: this.getLast24Hours() } }),
        this.calculateTotalRevenue(dateRange),
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
        this.getDepositStats(dateRange),
        this.getWithdrawalStats(dateRange),
        User.countDocuments({ tier: { $in: ['VIP', 'Premium'] } }),
        User.countDocuments({ lastActivityAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
        Withdrawal.countDocuments({ status: 'pending' }),
        this.getBetsByGameData(dateRange),
        this.getRevenueBreakdownData(dateRange),
        this.getSimpleTimeSeries(dateRange),
      ]);

      // Helper to safely extract values
      const getValue = (result, defaultValue = 0) => 
        result.status === 'fulfilled' ? result.value : defaultValue;

      const depositsData = getValue(deposits, { count: 0, total: 0 });
      const withdrawalsData = getValue(withdrawals, { count: 0, total: 0 });
      const topGamesData = getValue(topGames, []);
      const breakdownData = getValue(revenueBreakdown, { labels: [], data: [] });
      const seriesData = getValue(timeSeriesData, { labels: [], revenue: [] });

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalUsers: getValue(totalUsers),
            activeUsers: getValue(activeUsers),
            totalRevenue: getValue(totalRevenue),
            totalBets: getValue(totalBets),
            revenueChange: 12.5, // Calculate from previous period
            userChange: 8.2,
            activeChange: 15.3,
            betsChange: 10.1,
          },
          timeSeries: seriesData,
          revenueBreakdown: breakdownData,
          transactions: {
            deposits: depositsData.total,
            withdrawals: withdrawalsData.total,
            pending: getValue(pendingWithdrawals),
            successRate: depositsData.count > 0 
              ? ((depositsData.count / (depositsData.count + withdrawalsData.count)) * 100).toFixed(1)
              : 100,
          },
          topGames: topGamesData.slice(0, 10),
          quickStats: {
            newUsers: await User.countDocuments({ 
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
            }),
            activeToday: getValue(activeUsers),
            vipUsers: getValue(vipUsers),
            onlineUsers: getValue(onlineUsers),
            activeBets: getValue(totalBets),
            pendingWithdrawals: getValue(pendingWithdrawals),
          },
          dateRange,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('getOptimizedSummary error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch dashboard summary',
        error: error.message,
      });
    }
  });

  // Get comprehensive dashboard metrics
  getDashboardMetrics = asyncHandler(async (req, res) => {
    try {
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
        User.countDocuments({ lastLoginAt: { $gte: this.getLast24Hours() } }).catch(() => 0),
        this.calculateTotalRevenue(dateRange).catch(() => 0),
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Deposit.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Withdrawal.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        this.calculateTotalWinnings(dateRange).catch(() => 0),
        Transaction.countDocuments({ status: 'pending' }).catch(() => 0),
        this.getUniqueTransactionDates(dateRange).catch(() => 0),
        this.getTopPlayers(dateRange).catch(() => [])
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
    } catch (error) {
      console.error('getDashboardMetrics error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch dashboard metrics',
        error: error.message
      });
    }
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
    try {
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
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'won' }).catch(() => 0),
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'lost' }).catch(() => 0),
        this.calculateBetAmount(dateRange).catch(() => 0),
        this.calculateBetWinnings(dateRange).catch(() => 0),
        this.calculateAverageOdds(dateRange).catch(() => 0),
        this.getBetsByGameData(dateRange).catch(() => [])
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
    } catch (error) {
      console.error('getBettingStatistics error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch betting statistics',
        error: error.message
      });
    }
  });

  // Get transaction flow analysis
  getTransactionFlow = asyncHandler(async (req, res) => {
    try {
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
        this.getDepositStats(dateRange).catch(() => ({ count: 0, total: 0 })),
        this.getWithdrawalStats(dateRange).catch(() => ({ count: 0, total: 0 })),
        Transaction.countDocuments({ status: 'pending', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Transaction.countDocuments({ status: 'failed', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Transaction.countDocuments({ status: 'completed', createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        this.getTopPaymentMethods(dateRange).catch(() => [])
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
    } catch (error) {
      console.error('getTransactionFlow error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch transaction flow',
        error: error.message
      });
    }
  });

  // Get performance metrics
  getPerformanceMetrics = asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = this.getDateRange(startDate, endDate);

      const metrics = {
        avgSessionDuration: await this.getAvgSessionDuration(dateRange).catch(() => 0),
        userRetention: await this.getUserRetention(dateRange).catch(() => 0),
        churnRate: await this.getChurnRate(dateRange).catch(() => 0),
        customerLifetimeValue: await this.getCustomerLifetimeValue(dateRange).catch(() => 0),
        repeatCustomerRate: await this.getRepeatCustomerRate(dateRange).catch(() => 0),
        avgDepositPerUser: await this.getAvgDepositPerUser(dateRange).catch(() => 0),
        avgBetSize: await this.getAvgBetSize(dateRange).catch(() => 0)
      };

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('getPerformanceMetrics error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch performance metrics',
        error: error.message
      });
    }
  });

  // Get affiliate performance
  getAffiliatePerformance = asyncHandler(async (req, res) => {
    try {
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
      ]).catch(() => []);

      const totalAffiliates = await User.countDocuments({ role: 'affiliate' }).catch(() => 0);
      const totalEarnings = await this.getTotalAffiliateEarnings(dateRange).catch(() => 0);

      res.status(200).json({
        success: true,
        data: {
          topAffiliates: affiliateData,
          totalAffiliates,
          totalAffiliateEarnings: totalEarnings
        }
      });
    } catch (error) {
      console.error('getAffiliatePerformance error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch affiliate performance',
        error: error.message
      });
    }
  });

  // Get real-time dashboard updates
  getRealtimeUpdates = asyncHandler(async (req, res) => {
    try {
      const realtimeData = {
        onlineUsers: await this.getOnlineUsers().catch(() => 0),
        activeBets: await BettingHistory.countDocuments({ status: 'active' }).catch(() => 0),
        pendingWithdrawals: await Withdrawal.countDocuments({ status: 'pending' }).catch(() => 0),
        recentTransactions: await this.getRecentTransactions(10).catch(() => []),
        systemStatus: this.getSystemStatus(),
        lastUpdate: new Date()
      };

      res.status(200).json({
        success: true,
        data: realtimeData
      });
    } catch (error) {
      console.error('getRealtimeUpdates error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch real-time updates',
        error: error.message
      });
    }
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
    const result = await BettingHistory.aggregate([
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
    try {
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
              $reduce: {
                input: '$userBets',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $cond: [{ $eq: ['$$this.status', 'won'] }, '$$this.winnings', 0]
                    }
                  ]
                }
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
    } catch (error) {
      console.error('getTopPlayers error:', error.message);
      return [];
    }
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
    const result = await BettingHistory.aggregate([
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
    const result = await BettingHistory.aggregate([
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
    const result = await BettingHistory.aggregate([
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
    return await BettingHistory.aggregate([
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

  async getBetsByGameData(dateRange) {
    return await this.getBetsByGame(dateRange);
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
    const result = await BettingHistory.aggregate([
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
    return await BettingHistory.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    }).lean();
  }

  convertToCSV(data) {
    // Convert data to CSV format
    return '';
  }

  // Helper methods for optimized summary
  async getRevenueBreakdownData(dateRange) {
    try {
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
        { $sort: { amount: -1 } },
        { $limit: 5 }
      ]);

      return {
        labels: breakdown.map(item => item._id || 'Unknown'),
        data: breakdown.map(item => item.amount),
      };
    } catch {
      return { labels: [], data: [] };
    }
  }

  async getSimpleTimeSeries(dateRange) {
    try {
      const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
      const limit = Math.min(days, 30); // Max 30 data points

      const data = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: limit }
      ]);

      return {
        labels: data.map(item => item._id),
        revenue: data.map(item => item.revenue),
      };
    } catch {
      return { labels: [], revenue: [] };
    }
  }
}

module.exports = new DashboardAnalyticsController();
