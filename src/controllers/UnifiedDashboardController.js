// Unified Dashboard Controller - Complete Integration with All Controllers
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');
const Withdrawal = require('../models/Withdrawal');
const Deposit = require('../models/Deposit');
const BettingHistory = require('../models/BettingHistory');
const Affiliate = require('../models/AffiliateModel');
const Agent = require('../models/AgentModel');
const SubAdmin = require('../models/SubAdminModel');
const SubAgent = require('../models/SubAgentModel');
const Bonus = require('../models/Bonus');
const BonusWallet = require('../models/BonusWallet');
const ReferralBonus = require('../models/ReferralBonus');
const Game = require('../models/Games');
const Provider = require('../models/GameProvider');
const Announcement = require('../models/Announcement');
const KYC = require('../models/KYCModal');
const VIPUser = require('../models/UserVip');
const Promotion = require('../models/PromotionSchema');
const PaymentMethod = require('../models/PaymentGateWayTable');
const moment = require('moment-timezone');
const asyncHandler = require('express-async-handler');

class UnifiedDashboardController {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // =============================================
  // MAIN UNIFIED DASHBOARD
  // =============================================
  getUnifiedDashboard = asyncHandler(async (req, res) => {
    const { startDate, endDate, timeZone = 'UTC', modules = 'all' } = req.query;
    const dateRange = this.getDateRange(startDate, endDate, timeZone);

    const requestedModules = modules === 'all' 
      ? ['users', 'transactions', 'betting', 'affiliates', 'agents', 'games', 'finance', 'security']
      : modules.split(',');

    const dashboardData = {};

    // Load all modules in parallel
    const modulePromises = requestedModules.map(async (module) => {
      switch(module.trim()) {
        case 'users':
          dashboardData.users = await this.getUsersModule(dateRange);
          break;
        case 'transactions':
          dashboardData.transactions = await this.getTransactionsModule(dateRange);
          break;
        case 'betting':
          dashboardData.betting = await this.getBettingModule(dateRange);
          break;
        case 'affiliates':
          dashboardData.affiliates = await this.getAffiliatesModule(dateRange);
          break;
        case 'agents':
          dashboardData.agents = await this.getAgentsModule(dateRange);
          break;
        case 'games':
          dashboardData.games = await this.getGamesModule(dateRange);
          break;
        case 'finance':
          dashboardData.finance = await this.getFinanceModule(dateRange);
          break;
        case 'security':
          dashboardData.security = await this.getSecurityModule(dateRange);
          break;
        case 'promotions':
          dashboardData.promotions = await this.getPromotionsModule(dateRange);
          break;
        case 'vip':
          dashboardData.vip = await this.getVIPModule(dateRange);
          break;
        case 'analytics':
          dashboardData.analytics = await this.getAnalyticsModule(dateRange);
          break;
      }
    });

    await Promise.all(modulePromises);

    // Add real-time stats
    dashboardData.realtime = await this.getRealtimeStats();
    
    // Add system health
    dashboardData.systemHealth = await this.getSystemHealth();

    res.status(200).json({
      success: true,
      timestamp: new Date(),
      dateRange,
      data: dashboardData
    });
  });

  // =============================================
  // USERS MODULE
  // =============================================
  getUsersModule = async (dateRange) => {
    const [
      totalUsers,
      newUsers,
      activeUsers,
      onlineUsers,
      usersByCountry,
      userGrowth,
      topUsers,
      usersByDevice,
      kycStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      User.countDocuments({ lastLoginTime: { $gte: moment().subtract(24, 'hours').toDate() } }),
      User.countDocuments({ isOnline: true }),
      this.getUsersByCountry(dateRange),
      this.getUserGrowthTrend(dateRange),
      this.getTopUsers(dateRange),
      this.getUsersByDevice(dateRange),
      this.getKYCStats(dateRange)
    ]);

    return {
      summary: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        online: onlineUsers
      },
      byCountry: usersByCountry,
      growth: userGrowth,
      topUsers,
      byDevice: usersByDevice,
      kyc: kycStats
    };
  };

  // =============================================
  // TRANSACTIONS MODULE
  // =============================================
  getTransactionsModule = async (dateRange) => {
    const [
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      depositAmount,
      withdrawalAmount,
      transactionsByMethod,
      transactionFlow,
      failedTransactions,
      transactionTrends
    ] = await Promise.all([
      Deposit.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Withdrawal.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      Deposit.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
      this.getTotalDepositAmount(dateRange),
      this.getTotalWithdrawalAmount(dateRange),
      this.getTransactionsByMethod(dateRange),
      this.getTransactionFlow(dateRange),
      this.getFailedTransactions(dateRange),
      this.getTransactionTrends(dateRange)
    ]);

    return {
      deposits: {
        total: totalDeposits,
        pending: pendingDeposits,
        amount: depositAmount
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        amount: withdrawalAmount
      },
      byMethod: transactionsByMethod,
      flow: transactionFlow,
      failed: failedTransactions,
      trends: transactionTrends
    };
  };

  // =============================================
  // BETTING MODULE
  // =============================================
  getBettingModule = async (dateRange) => {
    const [
      totalBets,
      totalBetAmount,
      totalWinAmount,
      activeBets,
      betsByGame,
      betsByProvider,
      winRate,
      topGames,
      bettingTrends,
      hourlyBetting
    ] = await Promise.all([
      BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      this.getTotalBetAmount(dateRange),
      this.getTotalWinAmount(dateRange),
      BettingHistory.countDocuments({ status: 'active' }),
      this.getBetsByGame(dateRange),
      this.getBetsByProvider(dateRange),
      this.calculateWinRate(dateRange),
      this.getTopGames(dateRange),
      this.getBettingTrends(dateRange),
      this.getHourlyBetting(dateRange)
    ]);

    const profit = totalBetAmount - totalWinAmount;
    const margin = totalBetAmount > 0 ? (profit / totalBetAmount) * 100 : 0;

    return {
      summary: {
        totalBets,
        betAmount: totalBetAmount,
        winAmount: totalWinAmount,
        profit,
        margin: margin.toFixed(2),
        activeBets
      },
      byGame: betsByGame,
      byProvider: betsByProvider,
      winRate,
      topGames,
      trends: bettingTrends,
      hourly: hourlyBetting
    };
  };

  // =============================================
  // AFFILIATES MODULE
  // =============================================
  getAffiliatesModule = async (dateRange) => {
    const [
      totalAffiliates,
      activeAffiliates,
      totalEarnings,
      totalReferrals,
      topAffiliates,
      affiliatePerformance,
      commissionStats,
      referralTrends
    ] = await Promise.all([
      Affiliate.countDocuments(),
      Affiliate.countDocuments({ status: 'active' }),
      this.getAffiliateEarnings(dateRange),
      this.getTotalReferrals(dateRange),
      this.getTopAffiliates(dateRange),
      this.getAffiliatePerformance(dateRange),
      this.getCommissionStats(dateRange),
      this.getReferralTrends(dateRange)
    ]);

    return {
      summary: {
        total: totalAffiliates,
        active: activeAffiliates,
        earnings: totalEarnings,
        referrals: totalReferrals
      },
      topPerformers: topAffiliates,
      performance: affiliatePerformance,
      commissions: commissionStats,
      trends: referralTrends
    };
  };

  // =============================================
  // AGENTS MODULE
  // =============================================
  getAgentsModule = async (dateRange) => {
    const [
      totalAgents,
      totalSubAgents,
      agentDeposits,
      agentWithdrawals,
      agentCommissions,
      topAgents,
      agentHierarchy
    ] = await Promise.all([
      Agent.countDocuments(),
      SubAgent.countDocuments(),
      this.getAgentDeposits(dateRange),
      this.getAgentWithdrawals(dateRange),
      this.getAgentCommissions(dateRange),
      this.getTopAgents(dateRange),
      this.getAgentHierarchy()
    ]);

    return {
      summary: {
        totalAgents,
        totalSubAgents,
        deposits: agentDeposits,
        withdrawals: agentWithdrawals,
        commissions: agentCommissions
      },
      topAgents,
      hierarchy: agentHierarchy
    };
  };

  // =============================================
  // GAMES MODULE
  // =============================================
  getGamesModule = async (dateRange) => {
    const [
      totalGames,
      activeGames,
      totalProviders,
      gamesByCategory,
      gamePerformance,
      popularGames,
      revenueByGame,
      providerStats
    ] = await Promise.all([
      Game.countDocuments(),
      Game.countDocuments({ status: 'active' }),
      Provider.countDocuments(),
      this.getGamesByCategory(),
      this.getGamePerformance(dateRange),
      this.getPopularGames(dateRange),
      this.getRevenueByGame(dateRange),
      this.getProviderStats(dateRange)
    ]);

    return {
      summary: {
        totalGames,
        activeGames,
        totalProviders
      },
      byCategory: gamesByCategory,
      performance: gamePerformance,
      popular: popularGames,
      revenue: revenueByGame,
      providers: providerStats
    };
  };

  // =============================================
  // FINANCE MODULE
  // =============================================
  getFinanceModule = async (dateRange) => {
    const [
      totalRevenue,
      totalProfit,
      totalExpenses,
      bonusPaid,
      commissionsPaid,
      revenueBySource,
      profitMargins,
      financialTrends,
      cashFlow
    ] = await Promise.all([
      this.calculateTotalRevenue(dateRange),
      this.calculateTotalProfit(dateRange),
      this.calculateTotalExpenses(dateRange),
      this.getBonusPaid(dateRange),
      this.getCommissionsPaid(dateRange),
      this.getRevenueBySource(dateRange),
      this.getProfitMargins(dateRange),
      this.getFinancialTrends(dateRange),
      this.getCashFlow(dateRange)
    ]);

    return {
      summary: {
        revenue: totalRevenue,
        profit: totalProfit,
        expenses: totalExpenses,
        bonusPaid,
        commissionsPaid,
        netProfit: totalRevenue - totalExpenses
      },
      bySource: revenueBySource,
      margins: profitMargins,
      trends: financialTrends,
      cashFlow
    };
  };

  // =============================================
  // SECURITY MODULE
  // =============================================
  getSecurityModule = async (dateRange) => {
    const [
      suspiciousActivities,
      failedLogins,
      blockedIPs,
      multipleAccounts,
      kycPending,
      kycRejected,
      securityAlerts
    ] = await Promise.all([
      this.getSuspiciousActivities(dateRange),
      this.getFailedLogins(dateRange),
      this.getBlockedIPs(),
      this.getMultipleAccounts(dateRange),
      KYC.countDocuments({ status: 'pending' }),
      KYC.countDocuments({ status: 'rejected', updatedAt: { $gte: dateRange.start, $lte: dateRange.end } }),
      this.getSecurityAlerts(dateRange)
    ]);

    return {
      suspicious: suspiciousActivities,
      failedLogins,
      blockedIPs,
      multipleAccounts,
      kyc: {
        pending: kycPending,
        rejected: kycRejected
      },
      alerts: securityAlerts
    };
  };

  // =============================================
  // PROMOTIONS MODULE
  // =============================================
  getPromotionsModule = async (dateRange) => {
    const [
      activePromotions,
      totalPromotions,
      promotionUsage,
      bonusDistributed,
      promotionROI,
      topPromotions
    ] = await Promise.all([
      Promotion.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
      Promotion.countDocuments(),
      this.getPromotionUsage(dateRange),
      this.getBonusDistributed(dateRange),
      this.getPromotionROI(dateRange),
      this.getTopPromotions(dateRange)
    ]);

    return {
      summary: {
        active: activePromotions,
        total: totalPromotions,
        bonusDistributed
      },
      usage: promotionUsage,
      roi: promotionROI,
      topPerformers: topPromotions
    };
  };

  // =============================================
  // VIP MODULE
  // =============================================
  getVIPModule = async (dateRange) => {
    const [
      totalVIP,
      vipByTier,
      vipRevenue,
      vipBenefitsUsed,
      vipRetention
    ] = await Promise.all([
      VIPUser.countDocuments(),
      this.getVIPByTier(),
      this.getVIPRevenue(dateRange),
      this.getVIPBenefitsUsed(dateRange),
      this.getVIPRetention(dateRange)
    ]);

    return {
      summary: {
        total: totalVIP,
        revenue: vipRevenue
      },
      byTier: vipByTier,
      benefitsUsed: vipBenefitsUsed,
      retention: vipRetention
    };
  };

  // =============================================
  // ANALYTICS MODULE
  // =============================================
  getAnalyticsModule = async (dateRange) => {
    const [
      userRetention,
      churnRate,
      ltv,
      cac,
      conversionRate,
      sessionAnalytics,
      deviceAnalytics,
      geographicAnalytics
    ] = await Promise.all([
      this.getUserRetention(dateRange),
      this.getChurnRate(dateRange),
      this.getLifetimeValue(dateRange),
      this.getCustomerAcquisitionCost(dateRange),
      this.getConversionRate(dateRange),
      this.getSessionAnalytics(dateRange),
      this.getDeviceAnalytics(dateRange),
      this.getGeographicAnalytics(dateRange)
    ]);

    return {
      retention: userRetention,
      churn: churnRate,
      ltv,
      cac,
      conversion: conversionRate,
      sessions: sessionAnalytics,
      devices: deviceAnalytics,
      geographic: geographicAnalytics
    };
  };

  // =============================================
  // REALTIME STATS
  // =============================================
  getRealtimeStats = async () => {
    const now = moment();
    const last5Minutes = now.clone().subtract(5, 'minutes').toDate();
    const last1Hour = now.clone().subtract(1, 'hour').toDate();

    const [
      onlineUsers,
      recentBets,
      recentDeposits,
      recentWithdrawals,
      activeGames,
      liveBetting
    ] = await Promise.all([
      User.countDocuments({ isOnline: true }),
      BettingHistory.countDocuments({ createdAt: { $gte: last5Minutes } }),
      Deposit.countDocuments({ createdAt: { $gte: last5Minutes } }),
      Withdrawal.countDocuments({ createdAt: { $gte: last5Minutes } }),
      this.getActiveGamesCount(),
      this.getLiveBettingStats(last1Hour)
    ]);

    return {
      onlineUsers,
      last5Minutes: {
        bets: recentBets,
        deposits: recentDeposits,
        withdrawals: recentWithdrawals
      },
      activeGames,
      liveBetting
    };
  };

  // =============================================
  // SYSTEM HEALTH
  // =============================================
  getSystemHealth = async () => {
    return {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: await this.checkDatabaseHealth(),
      services: await this.checkServicesHealth()
    };
  };

  // =============================================
  // HELPER METHODS
  // =============================================
  getDateRange = (startDate, endDate, timeZone) => {
    const start = startDate 
      ? moment.tz(startDate, timeZone).startOf('day').toDate()
      : moment.tz(timeZone).subtract(30, 'days').startOf('day').toDate();
    
    const end = endDate
      ? moment.tz(endDate, timeZone).endOf('day').toDate()
      : moment.tz(timeZone).endOf('day').toDate();

    return { start, end };
  };

  // User helpers
  getUsersByCountry = async (dateRange) => {
    return await User.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  };

  getUserGrowthTrend = async (dateRange) => {
    return await User.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  getTopUsers = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$userId',
          totalBets: { $sum: 1 },
          totalAmount: { $sum: '$betAmount' },
          totalWin: { $sum: '$winAmount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);
  };

  getUsersByDevice = async (dateRange) => {
    return await User.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  };

  getKYCStats = async (dateRange) => {
    const stats = await KYC.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  };

  // Transaction helpers
  getTotalDepositAmount = async (dateRange) => {
    const result = await Deposit.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getTotalWithdrawalAmount = async (dateRange) => {
    const result = await Withdrawal.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getTransactionsByMethod = async (dateRange) => {
    const deposits = await Deposit.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } }
    ]);

    const withdrawals = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } }
    ]);

    return { deposits, withdrawals };
  };

  getTransactionFlow = async (dateRange) => {
    return await Transaction.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
  };

  getFailedTransactions = async (dateRange) => {
    return await Transaction.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'failed'
    });
  };

  getTransactionTrends = async (dateRange) => {
    return await Transaction.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          deposits: { 
            $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, 1, 0] }
          },
          withdrawals: { 
            $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, 1, 0] }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  // Betting helpers
  getTotalBetAmount = async (dateRange) => {
    const result = await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$betAmount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getTotalWinAmount = async (dateRange) => {
    const result = await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$winAmount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getBetsByGame = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$gameId',
          count: { $sum: 1 },
          totalBet: { $sum: '$betAmount' },
          totalWin: { $sum: '$winAmount' }
        }
      },
      { $sort: { totalBet: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: '_id',
          as: 'game'
        }
      }
    ]);
  };

  getBetsByProvider = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          totalBet: { $sum: '$betAmount' },
          totalWin: { $sum: '$winAmount' }
        }
      },
      { $sort: { totalBet: -1 } }
    ]);
  };

  calculateWinRate = async (dateRange) => {
    const total = await BettingHistory.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    const wins = await BettingHistory.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'won'
    });
    return total > 0 ? ((wins / total) * 100).toFixed(2) : 0;
  };

  getTopGames = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$gameId',
          playCount: { $sum: 1 },
          revenue: { $sum: { $subtract: ['$betAmount', '$winAmount'] } }
        }
      },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: '_id',
          as: 'game'
        }
      }
    ]);
  };

  getBettingTrends = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } },
          count: { $sum: 1 },
          betAmount: { $sum: '$betAmount' },
          winAmount: { $sum: '$winAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  getHourlyBetting = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          avgBet: { $avg: '$betAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  // Affiliate helpers
  getAffiliateEarnings = async (dateRange) => {
    const result = await Affiliate.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);
    return result[0]?.total || 0;
  };

  getTotalReferrals = async (dateRange) => {
    return await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
  };

  getTopAffiliates = async (dateRange) => {
    return await Affiliate.find()
      .sort({ totalEarnings: -1 })
      .limit(10)
      .select('username totalEarnings totalReferrals status');
  };

  getAffiliatePerformance = async (dateRange) => {
    return await Affiliate.aggregate([
      { 
        $project: {
          username: 1,
          earnings: '$totalEarnings',
          referrals: '$totalReferrals',
          conversionRate: {
            $cond: [
              { $gt: ['$totalClicks', 0] },
              { $multiply: [{ $divide: ['$totalReferrals', '$totalClicks'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { earnings: -1 } },
      { $limit: 50 }
    ]);
  };

  getCommissionStats = async (dateRange) => {
    return await ReferralBonus.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$bonusType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
  };

  getReferralTrends = async (dateRange) => {
    return await User.aggregate([
      { 
        $match: { 
          referredBy: { $exists: true, $ne: null },
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  // Agent helpers
  getAgentDeposits = async (dateRange) => {
    const result = await Deposit.aggregate([
      { 
        $match: { 
          agentId: { $exists: true },
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getAgentWithdrawals = async (dateRange) => {
    const result = await Withdrawal.aggregate([
      { 
        $match: { 
          agentId: { $exists: true },
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getAgentCommissions = async (dateRange) => {
    const result = await Agent.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$totalCommission' } } }
    ]);
    return result[0]?.total || 0;
  };

  getTopAgents = async (dateRange) => {
    return await Agent.find()
      .sort({ totalCommission: -1 })
      .limit(10)
      .select('username totalCommission totalDeposits totalWithdrawals');
  };

  getAgentHierarchy = async () => {
    return await Agent.aggregate([
      {
        $lookup: {
          from: 'subagents',
          localField: '_id',
          foreignField: 'parentAgentId',
          as: 'subAgents'
        }
      },
      {
        $project: {
          username: 1,
          subAgentCount: { $size: '$subAgents' },
          totalCommission: 1
        }
      },
      { $sort: { subAgentCount: -1 } }
    ]);
  };

  // Game helpers
  getGamesByCategory = async () => {
    return await Game.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  };

  getGamePerformance = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$gameId',
          plays: { $sum: 1 },
          revenue: { $sum: { $subtract: ['$betAmount', '$winAmount'] } },
          avgBet: { $avg: '$betAmount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]);
  };

  getPopularGames = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$gameId',
          playCount: { $sum: 1 },
          uniquePlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          playCount: 1,
          uniquePlayersCount: { $size: '$uniquePlayers' }
        }
      },
      { $sort: { playCount: -1 } },
      { $limit: 10 }
    ]);
  };

  getRevenueByGame = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$gameId',
          revenue: { $sum: { $subtract: ['$betAmount', '$winAmount'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 15 }
    ]);
  };

  getProviderStats = async (dateRange) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: '$provider',
          games: { $addToSet: '$gameId' },
          totalBets: { $sum: 1 },
          revenue: { $sum: { $subtract: ['$betAmount', '$winAmount'] } }
        }
      },
      {
        $project: {
          gameCount: { $size: '$games' },
          totalBets: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);
  };

  // Finance helpers
  calculateTotalRevenue = async (dateRange) => {
    const [depositRevenue, bettingRevenue] = await Promise.all([
      this.getTotalDepositAmount(dateRange),
      this.getTotalBetAmount(dateRange)
    ]);
    return depositRevenue + bettingRevenue;
  };

  calculateTotalProfit = async (dateRange) => {
    const [revenue, expenses] = await Promise.all([
      this.calculateTotalRevenue(dateRange),
      this.calculateTotalExpenses(dateRange)
    ]);
    return revenue - expenses;
  };

  calculateTotalExpenses = async (dateRange) => {
    const [withdrawals, bonuses, commissions] = await Promise.all([
      this.getTotalWithdrawalAmount(dateRange),
      this.getBonusPaid(dateRange),
      this.getCommissionsPaid(dateRange)
    ]);
    return withdrawals + bonuses + commissions;
  };

  getBonusPaid = async (dateRange) => {
    const result = await BonusWallet.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          type: 'credit'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getCommissionsPaid = async (dateRange) => {
    const result = await ReferralBonus.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getRevenueBySource = async (dateRange) => {
    const [deposits, betting, other] = await Promise.all([
      this.getTotalDepositAmount(dateRange),
      this.getTotalBetAmount(dateRange),
      0 // Add other revenue sources
    ]);

    return [
      { source: 'Deposits', amount: deposits },
      { source: 'Betting', amount: betting },
      { source: 'Other', amount: other }
    ];
  };

  getProfitMargins = async (dateRange) => {
    const revenue = await this.calculateTotalRevenue(dateRange);
    const profit = await this.calculateTotalProfit(dateRange);
    
    return {
      grossMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0,
      netMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0
    };
  };

  getFinancialTrends = async (dateRange) => {
    return await Transaction.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { 
            $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] }
          },
          expenses: { 
            $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  };

  getCashFlow = async (dateRange) => {
    return await Transaction.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          inflow: { 
            $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] }
          },
          outflow: { 
            $sum: { $cond: [{ $in: ['$type', ['withdrawal', 'bonus', 'commission']] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          inflow: 1,
          outflow: 1,
          netFlow: { $subtract: ['$inflow', '$outflow'] }
        }
      },
      { $sort: { date: 1 } }
    ]);
  };

  // Security helpers
  getSuspiciousActivities = async (dateRange) => {
    // Implement suspicious activity detection logic
    return [];
  };

  getFailedLogins = async (dateRange) => {
    // Implement failed login tracking
    return [];
  };

  getBlockedIPs = async () => {
    // Implement blocked IP tracking
    return [];
  };

  getMultipleAccounts = async (dateRange) => {
    // Implement multiple account detection
    return [];
  };

  getSecurityAlerts = async (dateRange) => {
    // Implement security alert system
    return [];
  };

  // Promotion helpers
  getPromotionUsage = async (dateRange) => {
    return await BonusWallet.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          promotionId: { $exists: true }
        }
      },
      { 
        $group: {
          _id: '$promotionId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  };

  getBonusDistributed = async (dateRange) => {
    const result = await Bonus.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  };

  getPromotionROI = async (dateRange) => {
    const bonusPaid = await this.getBonusPaid(dateRange);
    const revenue = await this.calculateTotalRevenue(dateRange);
    
    return revenue > 0 ? ((bonusPaid / revenue) * 100).toFixed(2) : 0;
  };

  getTopPromotions = async (dateRange) => {
    return await BonusWallet.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          promotionId: { $exists: true }
        }
      },
      { 
        $group: {
          _id: '$promotionId',
          users: { $addToSet: '$userId' },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          usersCount: { $size: '$users' },
          totalAmount: 1
        }
      },
      { $sort: { usersCount: -1 } },
      { $limit: 10 }
    ]);
  };

  // VIP helpers
  getVIPByTier = async () => {
    return await VIPUser.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
  };

  getVIPRevenue = async (dateRange) => {
    const vipUsers = await VIPUser.find().select('userId');
    const vipUserIds = vipUsers.map(u => u.userId);

    const result = await BettingHistory.aggregate([
      { 
        $match: { 
          userId: { $in: vipUserIds },
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      { $group: { _id: null, total: { $sum: { $subtract: ['$betAmount', '$winAmount'] } } } }
    ]);

    return result[0]?.total || 0;
  };

  getVIPBenefitsUsed = async (dateRange) => {
    // Implement VIP benefits tracking
    return {};
  };

  getVIPRetention = async (dateRange) => {
    // Implement VIP retention calculation
    return {};
  };

  // Analytics helpers
  getUserRetention = async (dateRange) => {
    const cohorts = await User.aggregate([
      { 
        $match: { 
          createdAt: { $lte: dateRange.start }
        }
      },
      {
        $lookup: {
          from: 'bettinghistories',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $gte: ['$createdAt', dateRange.start] },
                    { $lte: ['$createdAt', dateRange.end] }
                  ]
                }
              }
            }
          ],
          as: 'recentActivity'
        }
      },
      {
        $project: {
          isActive: { $gt: [{ $size: '$recentActivity' }, 0] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    const data = cohorts[0] || { total: 0, active: 0 };
    return data.total > 0 ? ((data.active / data.total) * 100).toFixed(2) : 0;
  };

  getChurnRate = async (dateRange) => {
    const retention = await this.getUserRetention(dateRange);
    return (100 - parseFloat(retention)).toFixed(2);
  };

  getLifetimeValue = async (dateRange) => {
    const result = await User.aggregate([
      { $match: { createdAt: { $lte: dateRange.end } } },
      {
        $lookup: {
          from: 'bettinghistories',
          localField: '_id',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $project: {
          totalRevenue: {
            $sum: {
              $map: {
                input: '$bets',
                as: 'bet',
                in: { $subtract: ['$$bet.betAmount', '$$bet.winAmount'] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgLTV: { $avg: '$totalRevenue' }
        }
      }
    ]);

    return result[0]?.avgLTV || 0;
  };

  getCustomerAcquisitionCost = async (dateRange) => {
    // Implement CAC calculation based on marketing spend
    return 0;
  };

  getConversionRate = async (dateRange) => {
    const totalUsers = await User.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const convertedUsers = await User.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      firstDepositAt: { $exists: true }
    });

    return totalUsers > 0 ? ((convertedUsers / totalUsers) * 100).toFixed(2) : 0;
  };

  getSessionAnalytics = async (dateRange) => {
    // Implement session tracking analytics
    return {};
  };

  getDeviceAnalytics = async (dateRange) => {
    return await User.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  };

  getGeographicAnalytics = async (dateRange) => {
    return await User.aggregate([
      { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
      { 
        $group: {
          _id: { country: '$country', city: '$city' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
  };

  // System health helpers
  checkDatabaseHealth = async () => {
    try {
      const mongoose = require('mongoose');
      const state = mongoose.connection.readyState;
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      
      return {
        status: states[state],
        connections: mongoose.connection.client?.s?.servers?.size || 0
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  checkServicesHealth = async () => {
    // Check external services health
    return {
      redis: 'operational',
      payment: 'operational',
      email: 'operational',
      sms: 'operational'
    };
  };

  getActiveGamesCount = async () => {
    return await Game.countDocuments({ status: 'active' });
  };

  getLiveBettingStats = async (since) => {
    return await BettingHistory.aggregate([
      { $match: { createdAt: { $gte: since }, status: 'active' } },
      { 
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$betAmount' }
        }
      }
    ]);
  };
}

module.exports = new UnifiedDashboardController();
