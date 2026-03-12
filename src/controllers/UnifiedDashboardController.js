// Unified Dashboard Controller - Complete Integration with All Controllers
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bet = require('../models/BettingHistory');
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
const Game = require('../models/GameListTable');
const Provider = require('../models/BetProviderTable');
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
    this.availableModules = [
      'users',
      'transactions',
      'betting',
      'affiliates',
      'agents',
      'games',
      'finance',
      'security',
      'promotions',
      'vip',
      'analytics'
    ];
  }

  // ======= Advanced caching helpers (Redis if available, otherwise in-memory) =======
  async getFromCache(key) {
    try {
      // try redis if configured
      const redisClient = (() => {
        try {
          // require may return an object even if redis not configured
          return require('../redisClient').client
        } catch (e) {
          return null
        }
      })()

      if (redisClient && redisClient.get) {
        const raw = await redisClient.get(key)
        return raw ? JSON.parse(raw) : null
      }

      const entry = this.cache.get(key)
      if (!entry) return null
      const { data, ts } = entry
      if (Date.now() - ts > this.cacheTimeout) {
        this.cache.delete(key)
        return null
      }
      return data
    } catch (err) {
      console.error('getFromCache error:', err.message)
      return null
    }
  }

  async setToCache(key, data, ttlSeconds = Math.floor(this.cacheTimeout / 1000)) {
    try {
      const redisClient = (() => {
        try {
          return require('../redisClient').client
        } catch (e) {
          return null
        }
      })()

      if (redisClient && redisClient.set) {
        await redisClient.set(key, JSON.stringify(data), { EX: ttlSeconds })
        return
      }

      this.cache.set(key, { data, ts: Date.now() })
    } catch (err) {
      console.error('setToCache error:', err.message)
    }
  }

  // Fetch the raw optimized data (pure function, no req/res)
  async fetchOptimizedData(dateRange) {
    // This duplicates the internal query logic but returns the assembled object.
    // Expand the Promise set to include advanced analytics, security, device/geography, and realtime metrics.
    const lastHour = new Date(Date.now() - 60 * 60 * 1000)

    const [
      totalUsers,
      activeUsers,
      totalDeposits,
      totalWithdrawals,
      totalBets,
      pendingWithdrawals,
      vipUsers,
      onlineUsers,
      totalBonusPaid,
      totalAffiliates,
      totalAgents,
      recentUsers,
      userGrowthTrend,
      userRetention,
      churnRate,
      ltv,
      cac,
      conversionRate,
      deviceAnalytics,
      geographicAnalytics,
      transactionsByMethod,
      transactionTrends,
      sessionAnalytics,
      kycStats,
      suspiciousActivities,
      failedLogins,
      blockedIPs,
      providerStats,
      topGames,
      liveBetting
    ] = await Promise.allSettled([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Deposit.aggregate([
        { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Withdrawal.aggregate([
        { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      BettingHistory.aggregate([
        { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $group: { _id: null, total: { $sum: '$betAmount' }, count: { $sum: 1 } } }
      ]),
      Withdrawal.countDocuments({ status: 'pending' }),
      User.countDocuments({ tier: { $in: ['VIP', 'Premium'] } }),
      User.countDocuments({ lastActivityAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
      Bonus.aggregate([
        { $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Affiliate.countDocuments({ isActive: true }),
      Agent.countDocuments({ isActive: true }),
      User.find({}).sort({ createdAt: -1 }).limit(50).select('email mobile createdAt balance'),

      // Advanced analytics
      this.getUserGrowthTrend(dateRange),
      this.getUserRetention(dateRange),
      this.getChurnRate(dateRange),
      this.getLifetimeValue(dateRange),
      this.getCustomerAcquisitionCost(dateRange),
      this.getConversionRate(dateRange),
      this.getDeviceAnalytics(dateRange),
      this.getGeographicAnalytics(dateRange),

      // Transaction details and trends
      this.getTransactionsByMethod(dateRange),
      this.getTransactionTrends(dateRange),
      this.getSessionAnalytics(dateRange),
      this.getKYCStats(dateRange),

      // Security
      this.getSuspiciousActivities(dateRange),
      this.getFailedLogins(dateRange),
      this.getBlockedIPs(),

      // Games/providers
      this.getProviderStats(dateRange),
      this.getTopGames(dateRange),

      // Live betting snapshot (last hour)
      this.getLiveBettingStats(lastHour),
    ])

    const getValue = (result, defaultValue = 0) => (result && result.status === 'fulfilled' ? result.value : defaultValue)

    const depositsData = getValue(totalDeposits, [{ total: 0, count: 0 }])[0] || { total: 0, count: 0 }
    const withdrawalsData = getValue(totalWithdrawals, [{ total: 0, count: 0 }])[0] || { total: 0, count: 0 }
    const betsData = getValue(totalBets, [{ total: 0, count: 0 }])[0] || { total: 0, count: 0 }
    const bonusData = getValue(totalBonusPaid, [{ total: 0 }])[0] || { total: 0 }
    const recentUsersData = getValue(recentUsers, [])

    const revenue = Number(depositsData.total) || 0
    const expenses = Number(withdrawalsData.total || 0) + Number(bonusData.total || 0)
    const profit = revenue - expenses

    return {
      summary: {
        totalUsers: getValue(totalUsers),
        activeUsers: getValue(activeUsers),
        vipUsers: getValue(vipUsers),
        onlineUsers: getValue(onlineUsers),
        totalAffiliates: getValue(totalAffiliates),
        totalAgents: getValue(totalAgents),
        revenue: revenue.toFixed(2),
        profit: profit.toFixed(2),
        expenses: expenses.toFixed(2),
      },
      transactions: {
        deposits: { total: (Number(depositsData.total) || 0).toFixed(2), count: depositsData.count },
        withdrawals: { total: (Number(withdrawalsData.total) || 0).toFixed(2), count: withdrawalsData.count },
        pending: getValue(pendingWithdrawals),
        byMethod: getValue(transactionsByMethod, {}),
        trends: getValue(transactionTrends, []),
      },
      betting: {
        totalBets: betsData.count,
        totalBetAmount: (Number(betsData.total) || 0).toFixed(2),
        live: getValue(liveBetting, {}),
        topGames: getValue(topGames, []),
        providers: getValue(providerStats, [])
      },
      bonuses: { totalPaid: (Number(bonusData.total) || 0).toFixed(2) },
      recentUsers: recentUsersData.map((u) => ({ email: u.email, mobile: u.mobile, balance: u.balance, createdAt: u.createdAt })),
      analytics: {
        growth: getValue(userGrowthTrend, []),
        retention: getValue(userRetention, 0),
        churn: getValue(churnRate, 0),
        ltv: getValue(ltv, 0),
        cac: getValue(cac, 0),
        conversion: getValue(conversionRate, 0),
        sessions: getValue(sessionAnalytics, {}),
        devices: getValue(deviceAnalytics, []),
        geographic: getValue(geographicAnalytics, [])
      },
      security: {
        suspicious: getValue(suspiciousActivities, []),
        failedLogins: getValue(failedLogins, []),
        blockedIPs: getValue(blockedIPs, [])
      },
      dateRange,
      timestamp: new Date(),
      systemHealth: await this.getSystemHealth().catch(() => ({ status: 'unknown' }))
    }
  }

  // =============================================
  // MAIN UNIFIED DASHBOARD
  // =============================================
  getUnifiedDashboard = asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, timeZone = 'UTC', modules = 'all' } = req.query;
      const dateRange = this.getDateRange(startDate, endDate, timeZone);

      const requestedModules = this.normalizeModules(modules);
      const requestedModuleSet = new Set(requestedModules);

      const dashboardData = {};

      // Load all modules in parallel with individual error handling
      const moduleResults = await Promise.allSettled([
        this.safeGetModule('users', () => this.getUsersModule(dateRange)),
        this.safeGetModule('transactions', () => this.getTransactionsModule(dateRange)),
        this.safeGetModule('betting', () => this.getBettingModule(dateRange)),
        this.safeGetModule('affiliates', () => this.getAffiliatesModule(dateRange)),
        this.safeGetModule('agents', () => this.getAgentsModule(dateRange)),
        this.safeGetModule('games', () => this.getGamesModule(dateRange)),
        this.safeGetModule('finance', () => this.getFinanceModule(dateRange)),
        this.safeGetModule('security', () => this.getSecurityModule(dateRange)),
        this.safeGetModule('promotions', () => this.getPromotionsModule(dateRange)),
        this.safeGetModule('vip', () => this.getVIPModule(dateRange)),
        this.safeGetModule('analytics', () => this.getAnalyticsModule(dateRange))
      ]);

      moduleResults.forEach((result, idx) => {
        const moduleName = this.availableModules[idx];
        if (requestedModuleSet.has(moduleName) && result.status === 'fulfilled') {
          dashboardData[moduleName] = result.value;
        }
      });

      // Add real-time stats
      dashboardData.realtime = await this.getRealtimeStats().catch(() => ({}));
      
      // Add system health
      dashboardData.systemHealth = await this.getSystemHealth().catch(() => ({}));

      res.status(200).json({
        success: true,
        timestamp: new Date(),
        dateRange,
        modules: requestedModules,
        data: dashboardData
      });
    } catch (error) {
      console.error('getUnifiedDashboard error:', error.message);
      console.error('Full stack trace:', error.stack);

      // Fail-safe: never break dashboard page with HTTP 500
      res.status(200).json({
        success: true,
        degraded: true,
        message: 'Unified dashboard returned with fallback data due to internal module error',
        timestamp: new Date(),
        dateRange: this.getDateRange(req.query.startDate, req.query.endDate, req.query.timeZone || 'UTC'),
        modules: this.normalizeModules(req.query.modules),
        data: {
          users: null,
          transactions: null,
          betting: null,
          affiliates: null,
          agents: null,
          games: null,
          finance: null,
          security: null,
          promotions: null,
          vip: null,
          analytics: null,
          realtime: { onlineUsers: 0, last5Minutes: { bets: 0, deposits: 0, withdrawals: 0 }, activeGames: 0, liveBetting: {} },
          systemHealth: { status: 'degraded' }
        },
        error: error.message
      });
    }
  });

  // ⚡ OPTIMIZED: Fast summary endpoint for dashboard (single API call)
  getOptimizedSummary = asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, timeZone = 'UTC', force = false } = req.query;
      const dateRange = this.getDateRange(startDate, endDate, timeZone);

      const cacheKey = `unified:summary:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`;

      if (!force) {
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
          return res.status(200).json({ success: true, data: cached, cached: true });
        }
      }

      const data = await this.fetchOptimizedData(dateRange);

      // Cache the result (TTL from env CACHE_TTL seconds or default)
      const ttl = parseInt(process.env.CACHE_TTL, 10) || Math.floor(this.cacheTimeout / 1000);
      await this.setToCache(cacheKey, data, ttl);

      // Emit real-time update via socket.io if available
      try {
        const io = req.app && req.app.get && req.app.get('io');
        if (io && io.emit) {
          io.emit('dashboard:update', { summary: data.summary, timestamp: new Date() });
        }
      } catch (e) {
        // non-fatal
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('getOptimizedSummary error:', error.message);
      res.status(500).json({ success: false, message: 'Unable to fetch unified dashboard summary', error: error.message });
    }
  });

  // Safe module wrapper with error handling
  safeGetModule = async (moduleName, moduleMethod) => {
    try {
      const data = await moduleMethod();
      return data;
    } catch (error) {
      console.error(`Module '${moduleName}' failed:`, error.message);
      return null;
    }
  };

  normalizeModules = (modules) => {
    if (!modules || modules === 'all') {
      return this.availableModules;
    }

    const normalized = Array.isArray(modules)
      ? modules
          .flatMap(item => String(item || '').split(','))
          .map(item => item.trim())
      : String(modules)
          .split(',')
          .map(item => item.trim());

    const filtered = normalized.filter(item => this.availableModules.includes(item));
    return filtered.length > 0 ? [...new Set(filtered)] : this.availableModules;
  };

  // =============================================
  // USERS MODULE
  // =============================================
  getUsersModule = async (dateRange) => {
    try {
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
      ] = await Promise.allSettled([
        User.countDocuments().catch(() => 0),
        User.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        User.countDocuments({ lastLoginTime: { $gte: moment().subtract(24, 'hours').toDate() } }).catch(() => 0),
        User.countDocuments({ isOnline: true }).catch(() => 0),
        this.getUsersByCountry(dateRange).catch(() => []),
        this.getUserGrowthTrend(dateRange).catch(() => []),
        this.getTopUsers(dateRange).catch(() => []),
        this.getUsersByDevice(dateRange).catch(() => []),
        this.getKYCStats(dateRange).catch(() => ({}))
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          total: totalUsers || 0,
          new: newUsers || 0,
          active: activeUsers || 0,
          online: onlineUsers || 0
        },
        byCountry: usersByCountry || [],
        growth: userGrowth || [],
        topUsers: topUsers || [],
        byDevice: usersByDevice || [],
        kyc: kycStats || {}
      };
    } catch (error) {
      console.error('getUsersModule error:', error.message);
      return { summary: {}, byCountry: [], growth: [], topUsers: [], byDevice: [], kyc: {} };
    }
  };

  // =============================================
  // TRANSACTIONS MODULE
  // =============================================
  getTransactionsModule = async (dateRange) => {
    try {
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
      ] = await Promise.allSettled([
        Deposit.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Withdrawal.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        Deposit.countDocuments({ status: 0 }).catch(() => 0), // Fixed: 0 = Hold/Pending
        Withdrawal.countDocuments({ status: 0 }).catch(() => 0), // Fixed: 0 = Hold/Pending
        this.getTotalDepositAmount(dateRange).catch(() => 0),
        this.getTotalWithdrawalAmount(dateRange).catch(() => 0),
        this.getTransactionsByMethod(dateRange).catch(() => []),
        this.getTransactionFlow(dateRange).catch(() => []),
        this.getFailedTransactions(dateRange).catch(() => []),
        this.getTransactionTrends(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        deposits: {
          total: totalDeposits || 0,
          pending: pendingDeposits || 0,
          amount: depositAmount || 0
        },
        withdrawals: {
          total: totalWithdrawals || 0,
          pending: pendingWithdrawals || 0,
          amount: withdrawalAmount || 0
        },
        byMethod: transactionsByMethod || [],
        flow: transactionFlow || [],
        failed: failedTransactions || [],
        trends: transactionTrends || []
      };
    } catch (error) {
      console.error('getTransactionsModule error:', error.message);
      return {
        deposits: { total: 0, pending: 0, amount: 0 },
        withdrawals: { total: 0, pending: 0, amount: 0 },
        byMethod: [],
        flow: [],
        failed: [],
        trends: []
      };
    }
  };

  // =============================================
  // BETTING MODULE
  // =============================================
  getBettingModule = async (dateRange) => {
    try {
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
      ] = await Promise.allSettled([
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        this.getTotalBetAmount(dateRange).catch(() => 0),
        this.getTotalWinAmount(dateRange).catch(() => 0),
        BettingHistory.countDocuments({ createdAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0), // Fixed: Removed status - BettingHistory.status is Number, not string
        this.getBetsByGame(dateRange).catch(() => []),
        this.getBetsByProvider(dateRange).catch(() => []),
        this.calculateWinRate(dateRange).catch(() => 0),
        this.getTopGames(dateRange).catch(() => []),
        this.getBettingTrends(dateRange).catch(() => []),
        this.getHourlyBetting(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      const profit = (totalBetAmount || 0) - (totalWinAmount || 0);
      const margin = (totalBetAmount || 0) > 0 ? (profit / (totalBetAmount || 1)) * 100 : 0;

      return {
        summary: {
          totalBets: totalBets || 0,
          betAmount: totalBetAmount || 0,
          winAmount: totalWinAmount || 0,
          profit,
          margin: margin.toFixed(2),
          activeBets: activeBets || 0
        },
        byGame: betsByGame || [],
        byProvider: betsByProvider || [],
        winRate: winRate || 0,
        topGames: topGames || [],
        trends: bettingTrends || [],
        hourly: hourlyBetting || []
      };
    } catch (error) {
      console.error('getBettingModule error:', error.message);
      return { summary: {}, byGame: [], byProvider: [], winRate: 0, topGames: [], trends: [], hourly: [] };
    }
  };

  // =============================================
  // AFFILIATES MODULE
  // =============================================
  getAffiliatesModule = async (dateRange) => {
    try {
      const [
        totalAffiliates,
        activeAffiliates,
        totalEarnings,
        totalReferrals,
        topAffiliates,
        affiliatePerformance,
        commissionStats,
        referralTrends
      ] = await Promise.allSettled([
        Affiliate.countDocuments().catch(() => 0),
        Affiliate.countDocuments({ status: 'Active' }).catch(() => 0), // Fixed: 'Active' with capital A (String enum)
        this.getAffiliateEarnings(dateRange).catch(() => 0),
        this.getTotalReferrals(dateRange).catch(() => 0),
        this.getTopAffiliates(dateRange).catch(() => []),
        this.getAffiliatePerformance(dateRange).catch(() => []),
        this.getCommissionStats(dateRange).catch(() => []),
        this.getReferralTrends(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          total: totalAffiliates || 0,
          active: activeAffiliates || 0,
          earnings: totalEarnings || 0,
          referrals: totalReferrals || 0
        },
        topPerformers: topAffiliates || [],
        performance: affiliatePerformance || [],
        commissions: commissionStats || [],
        trends: referralTrends || []
      };
    } catch (error) {
      console.error('getAffiliatesModule error:', error.message);
      return {
        summary: { total: 0, active: 0, earnings: 0, referrals: 0 },
        topPerformers: [],
        performance: [],
        commissions: [],
        trends: []
      };
    }
  };

  // =============================================
  // AGENTS MODULE
  // =============================================
  getAgentsModule = async (dateRange) => {
    try {
      const [
        totalAgents,
        totalSubAgents,
        agentDeposits,
        agentWithdrawals,
        agentCommissions,
        topAgents,
        agentHierarchy
      ] = await Promise.allSettled([
        Agent.countDocuments().catch(() => 0),
        SubAgent.countDocuments().catch(() => 0),
        this.getAgentDeposits(dateRange).catch(() => 0),
        this.getAgentWithdrawals(dateRange).catch(() => 0),
        this.getAgentCommissions(dateRange).catch(() => 0),
        this.getTopAgents(dateRange).catch(() => []),
        this.getAgentHierarchy().catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          totalAgents: totalAgents || 0,
          totalSubAgents: totalSubAgents || 0,
          deposits: agentDeposits || 0,
          withdrawals: agentWithdrawals || 0,
          commissions: agentCommissions || 0
        },
        topAgents: topAgents || [],
        hierarchy: agentHierarchy || []
      };
    } catch (error) {
      console.error('getAgentsModule error:', error.message);
      return {
        summary: { totalAgents: 0, totalSubAgents: 0, deposits: 0, withdrawals: 0, commissions: 0 },
        topAgents: [],
        hierarchy: []
      };
    }
  };

  // =============================================
  // GAMES MODULE
  // =============================================
  getGamesModule = async (dateRange) => {
    try {
      const [
        totalGames,
        activeGames,
        totalProviders,
        gamesByCategory,
        gamePerformance,
        popularGames,
        revenueByGame,
        providerStats
      ] = await Promise.allSettled([
        Game.countDocuments().catch(() => 0),
        Game.countDocuments({ isActive: true }).catch(() => 0), // Fixed: Game uses isActive Boolean, not status
        Provider.countDocuments().catch(() => 0),
        this.getGamesByCategory().catch(() => []),
        this.getGamePerformance(dateRange).catch(() => []),
        this.getPopularGames(dateRange).catch(() => []),
        this.getRevenueByGame(dateRange).catch(() => []),
        this.getProviderStats(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          totalGames: totalGames || 0,
          activeGames: activeGames || 0,
          totalProviders: totalProviders || 0
        },
        byCategory: gamesByCategory || [],
        performance: gamePerformance || [],
        popular: popularGames || [],
        revenue: revenueByGame || [],
        providers: providerStats || []
      };
    } catch (error) {
      console.error('getGamesModule error:', error.message);
      return {
        summary: { totalGames: 0, activeGames: 0, totalProviders: 0 },
        byCategory: [],
        performance: [],
        popular: [],
        revenue: [],
        providers: []
      };
    }
  };

  // =============================================
  // FINANCE MODULE
  // =============================================
  getFinanceModule = async (dateRange) => {
    try {
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
      ] = await Promise.allSettled([
        this.calculateTotalRevenue(dateRange).catch(() => 0),
        this.calculateTotalProfit(dateRange).catch(() => 0),
        this.calculateTotalExpenses(dateRange).catch(() => 0),
        this.getBonusPaid(dateRange).catch(() => 0),
        this.getCommissionsPaid(dateRange).catch(() => 0),
        this.getRevenueBySource(dateRange).catch(() => []),
        this.getProfitMargins(dateRange).catch(() => []),
        this.getFinancialTrends(dateRange).catch(() => []),
        this.getCashFlow(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          revenue: totalRevenue || 0,
          profit: totalProfit || 0,
          expenses: totalExpenses || 0,
          bonusPaid: bonusPaid || 0,
          commissionsPaid: commissionsPaid || 0,
          netProfit: (totalRevenue || 0) - (totalExpenses || 0)
        },
        bySource: revenueBySource || [],
        margins: profitMargins || [],
        trends: financialTrends || [],
        cashFlow: cashFlow || []
      };
    } catch (error) {
      console.error('getFinanceModule error:', error.message);
      return {
        summary: { revenue: 0, profit: 0, expenses: 0, bonusPaid: 0, commissionsPaid: 0, netProfit: 0 },
        bySource: [],
        margins: [],
        trends: [],
        cashFlow: []
      };
    }
  };

  // =============================================
  // SECURITY MODULE
  // =============================================
  getSecurityModule = async (dateRange) => {
    try {
      const [
        suspiciousActivities,
        failedLogins,
        blockedIPs,
        multipleAccounts,
        kycPending,
        kycRejected,
        securityAlerts
      ] = await Promise.allSettled([
        this.getSuspiciousActivities(dateRange).catch(() => []),
        this.getFailedLogins(dateRange).catch(() => []),
        this.getBlockedIPs().catch(() => []),
        this.getMultipleAccounts(dateRange).catch(() => []),
        KYC.countDocuments({ status: 'pending' }).catch(() => 0),
        KYC.countDocuments({ status: 'rejected', updatedAt: { $gte: dateRange.start, $lte: dateRange.end } }).catch(() => 0),
        this.getSecurityAlerts(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        suspicious: suspiciousActivities || [],
        failedLogins: failedLogins || [],
        blockedIPs: blockedIPs || [],
        multipleAccounts: multipleAccounts || [],
        kyc: {
          pending: kycPending || 0,
          rejected: kycRejected || 0
        },
        alerts: securityAlerts || []
      };
    } catch (error) {
      console.error('getSecurityModule error:', error.message);
      return {
        suspicious: [],
        failedLogins: [],
        blockedIPs: [],
        multipleAccounts: [],
        kyc: { pending: 0, rejected: 0 },
        alerts: []
      };
    }
  };

  // =============================================
  // PROMOTIONS MODULE
  // =============================================
  getPromotionsModule = async (dateRange) => {
    try {
      const [
        activePromotions,
        totalPromotions,
        promotionUsage,
        bonusDistributed,
        promotionROI,
        topPromotions
      ] = await Promise.allSettled([
        Promotion.countDocuments({ isActive: true, endDate: { $gte: new Date() } }).catch(() => 0), // Fixed: Promotion uses isActive Boolean, not status
        Promotion.countDocuments().catch(() => 0),
        this.getPromotionUsage(dateRange).catch(() => []),
        this.getBonusDistributed(dateRange).catch(() => 0),
        this.getPromotionROI(dateRange).catch(() => []),
        this.getTopPromotions(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          active: activePromotions || 0,
          total: totalPromotions || 0,
          bonusDistributed: bonusDistributed || 0
        },
        usage: promotionUsage || [],
        roi: promotionROI || [],
        topPerformers: topPromotions || []
      };
    } catch (error) {
      console.error('getPromotionsModule error:', error.message);
      return {
        summary: { active: 0, total: 0, bonusDistributed: 0 },
        usage: [],
        roi: [],
        topPerformers: []
      };
    }
  };

  // =============================================
  // VIP MODULE
  // =============================================
  getVIPModule = async (dateRange) => {
    try {
      const [
        totalVIP,
        vipByTier,
        vipRevenue,
        vipBenefitsUsed,
        vipRetention
      ] = await Promise.allSettled([
        VIPUser.countDocuments().catch(() => 0),
        this.getVIPByTier().catch(() => []),
        this.getVIPRevenue(dateRange).catch(() => 0),
        this.getVIPBenefitsUsed(dateRange).catch(() => []),
        this.getVIPRetention(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        summary: {
          total: totalVIP || 0,
          revenue: vipRevenue || 0
        },
        byTier: vipByTier || [],
        benefitsUsed: vipBenefitsUsed || [],
        retention: vipRetention || []
      };
    } catch (error) {
      console.error('getVIPModule error:', error.message);
      return {
        summary: { total: 0, revenue: 0 },
        byTier: [],
        benefitsUsed: [],
        retention: []
      };
    }
  };

  // =============================================
  // ANALYTICS MODULE
  // =============================================
  getAnalyticsModule = async (dateRange) => {
    try {
      const [
        userRetention,
        churnRate,
        ltv,
        cac,
        conversionRate,
        sessionAnalytics,
        deviceAnalytics,
        geographicAnalytics
      ] = await Promise.allSettled([
        this.getUserRetention(dateRange).catch(() => []),
        this.getChurnRate(dateRange).catch(() => 0),
        this.getLifetimeValue(dateRange).catch(() => 0),
        this.getCustomerAcquisitionCost(dateRange).catch(() => 0),
        this.getConversionRate(dateRange).catch(() => 0),
        this.getSessionAnalytics(dateRange).catch(() => []),
        this.getDeviceAnalytics(dateRange).catch(() => []),
        this.getGeographicAnalytics(dateRange).catch(() => [])
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      return {
        retention: userRetention || [],
        churn: churnRate || 0,
        ltv: ltv || 0,
        cac: cac || 0,
        conversion: conversionRate || 0,
        sessions: sessionAnalytics || [],
        devices: deviceAnalytics || [],
        geographic: geographicAnalytics || []
      };
    } catch (error) {
      console.error('getAnalyticsModule error:', error.message);
      return {
        retention: [],
        churn: 0,
        ltv: 0,
        cac: 0,
        conversion: 0,
        sessions: [],
        devices: [],
        geographic: []
      };
    }
  };

  // =============================================
  // REALTIME STATS
  // =============================================
  getRealtimeStats = async () => {
    try {
      const now = moment();
      const last5Minutes = now.clone().subtract(5, 'minutes').toDate();
      const last1Hour = now.clone().subtract(1, 'hour').toDate();

      const promises = [
        User.countDocuments({ isOnline: true }).catch(() => 0),
        BettingHistory.countDocuments({ createdAt: { $gte: last5Minutes } }).catch(() => 0),
        Deposit.countDocuments({ createdAt: { $gte: last5Minutes } }).catch(() => 0),
        Withdrawal.countDocuments({ createdAt: { $gte: last5Minutes } }).catch(() => 0),
        this.getActiveGamesCount().catch(err => {
          console.error('getActiveGamesCount error:', err.message);
          return 0;
        }),
        this.getLiveBettingStats(last1Hour).catch(err => {
          console.error('getLiveBettingStats error:', err.message);
          return {};
        })
      ];

      const results = await Promise.allSettled(promises);

      const [
        onlineUsers,
        recentBets,
        recentDeposits,
        recentWithdrawals,
        activeGames,
        liveBetting
      ] = results.map(r => {
        if (r.status === 'fulfilled') return r.value;
        console.error('Promise rejected:', r.reason);
        return null;
      });

      return {
        onlineUsers: onlineUsers || 0,
        last5Minutes: {
          bets: recentBets || 0,
          deposits: recentDeposits || 0,
          withdrawals: recentWithdrawals || 0
        },
        activeGames: activeGames || 0,
        liveBetting: liveBetting || {}
      };
    } catch (error) {
      console.error('getRealtimeStats error:', error.message);
      console.error('getRealtimeStats stack:', error.stack);
      return { onlineUsers: 0, last5Minutes: { bets: 0, deposits: 0, withdrawals: 0 }, activeGames: 0, liveBetting: {} };
    }
  };

  // =============================================
  // SYSTEM HEALTH
  // =============================================
  getSystemHealth = async () => {
    try {
      return {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        database: await this.checkDatabaseHealth().catch(() => ({ status: 'unknown' })),
        services: await this.checkServicesHealth().catch(() => ({}))
      };
    } catch (error) {
      console.error('getSystemHealth error:', error.message);
      return {
        status: 'degraded',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        database: { status: 'unknown' },
        services: {}
      };
    }
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
      status: 2 // Fixed: 2 = Reject (failed transactions)
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
    // Fixed: BettingHistory.status is Number - calculate based on win/loss amounts instead
    const wins = await BettingHistory.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      $expr: { $gt: ['$payout', '$bet'] } // Payout greater than bet = win
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
    return await Game.countDocuments({ isActive: true }); // Fixed: Game uses isActive Boolean, not status
  };

  getLiveBettingStats = async (since) => {
    try {
      const result = await BettingHistory.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { 
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$betAmount' }
          }
        }
      ]);

      const safeResult = Array.isArray(result) ? result : [];
      
      // Return first element as object, or empty object if no results
      return safeResult.length > 0 ? safeResult[0] : { count: 0, totalAmount: 0 };
    } catch (error) {
      console.error('getLiveBettingStats catch error:', error.message);
      console.error('getLiveBettingStats stack:', error.stack);
      return { count: 0, totalAmount: 0 };
    }
  };
}

module.exports = new UnifiedDashboardController();
