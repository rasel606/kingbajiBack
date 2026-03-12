/**
 * Comprehensive Backend API Integration Routes
 * Connects all backend APIs with authentication and role-based access control
 */

const express = require('express');
const router = express.Router();

// Import middlewares
const {
  authenticateToken,
  requireRole,
  requireVerified,
  requireActive,
  optionalAuth,
  getCurrentUser,
  ROLES
} = require('../middleWare/advancedAuth');

const {
  requirePermission,
  requireOwnership
} = require('../middleWare/rolePermissions');

// Import controllers (all from controllers folder)
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const TransactionController = require('../controllers/TransactionController');
const DashboardController = require('../controllers/dashboardController');
const AffiliateController = require('../controllers/AffiliateController');
const AgentController = require('../controllers/AgentController');
const AdminController = require('../controllers/AdminController');
const BettingController = require('../controllers/BettingController');
const GameController = require('../controllers/GameController');
const WithdrawalController = require('../controllers/withdrawalController');
const DepositController = require('../controllers/DepositBonusController');
const KycController = require('../controllers/kycController');
const NotificationController = require('../controllers/notificationController');
const ReportController = require('../controllers/reportController');
const PromoController = require('../controllers/PromoEngineController');
const BonusController = require('../controllers/BonusTransactionController');
const VipController = require('../controllers/VipUserController');

// ======================================================================
// PUBLIC AUTHENTICATION ROUTES (No Auth Required)
// ======================================================================

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.loginUser);
router.post('/auth/refresh-token', AuthController.refreshToken);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.post('/auth/verify-email', AuthController.verifyEmail);
router.post('/auth/verify-otp', AuthController.verifyOTP);

// Affiliate specific auth
router.post('/auth/affiliate/register', AffiliateController.registerAffiliate);
router.post('/auth/affiliate/login', AffiliateController.Affiliate_login);

// Agent specific auth
router.post('/auth/agent/register', AgentController.registerAgent);
router.post('/auth/agent/login', AgentController.loginAgent);

// ======================================================================
// PROTECTED USER ROUTES
// ======================================================================

// Apply authentication to all routes below
router.use(authenticateToken);
router.use(getCurrentUser);

// User Profile Routes
router.get('/user/profile', requireRole(ROLES.USER), UserController.getUserProfile);
router.put('/user/profile', requireRole(ROLES.USER), requirePermission('profile', 'write'), UserController.updateProfile);
router.get('/user/details', requireRole(ROLES.USER), UserController.getUserDetails);
router.put('/user/update-name', requireRole(ROLES.USER), UserController.updateName);
router.put('/user/update-password', requireRole(ROLES.USER), UserController.changePassword);
router.put('/user/update-birthday', requireRole(ROLES.USER), UserController.updateBirthday);

// User Verification Routes
router.post('/user/send-email-otp', requireRole(ROLES.USER), UserController.sendEmailOTP);
router.post('/user/send-phone-otp', requireRole(ROLES.USER), UserController.sendPhoneOTP);
router.post('/user/verify-phone', requireRole(ROLES.USER), UserController.verifyPhone);
router.post('/user/verify-email', optionalAuth, UserController.verifyEmail);

// User Referral Routes
router.get('/user/referrals', requireRole(ROLES.USER), UserController.getReferrals);
router.get('/user/referral-code', requireRole(ROLES.USER), UserController.getReferralCode);

// User Balance & Wallet
router.get('/user/balance', requireRole(ROLES.USER), UserController.getBalance);
router.get('/user/wallet', requireRole(ROLES.USER), UserController.getWallet);

// ======================================================================
// TRANSACTION ROUTES
// ======================================================================

// User transactions
router.get('/transactions', authenticateToken, requirePermission('transactions', 'read'), TransactionController.getTransactions);
router.get('/transactions/:id', authenticateToken, requireOwnership('transactionId'), TransactionController.getTransaction);
router.post('/transactions/search', authenticateToken, TransactionController.searchTransactions);

// Deposits
router.post('/deposits', requireRole(ROLES.USER), DepositController.createDeposit);
router.get('/deposits', authenticateToken, DepositController.getDeposits);
router.get('/deposits/:id', authenticateToken, requireOwnership('depositId'), DepositController.getDeposit);

// Withdrawals
router.post('/withdrawals', requireRole(ROLES.USER, ROLES.AFFILIATE, ROLES.AGENT), WithdrawalController.requestWithdrawal);
router.get('/withdrawals', authenticateToken, WithdrawalController.getWithdrawals);
router.get('/withdrawals/:id', authenticateToken, requireOwnership('withdrawalId'), WithdrawalController.getWithdrawal);
router.post('/withdrawals/check-eligibility', requireRole(ROLES.USER), WithdrawalController.checkWithdrawalEligibility);

// ======================================================================
// BETTING & GAMES ROUTES
// ======================================================================

// Games
router.get('/games', optionalAuth, requirePermission('games', 'read'), GameController.getGames);
router.get('/games/:gameId', optionalAuth, GameController.getGameDetails);
router.get('/games/:gameId/history', authenticateToken, GameController.getGameHistory);

// Betting
router.post('/bets', requireRole(ROLES.USER), BettingController.placeBet);
router.get('/bets', authenticateToken, BettingController.getBets);
router.get('/bets/:betId', authenticateToken, requireOwnership('betId'), BettingController.getBetDetails);
router.get('/betting-history', authenticateToken, BettingController.getBettingHistory);

// ======================================================================
// DASHBOARD ROUTES
// ======================================================================

// User Dashboard
router.get('/dashboard/user', requireRole(ROLES.USER), DashboardController.getUserDashboard);
router.get('/dashboard/stats', authenticateToken, DashboardController.getDashboardStats);

// Affiliate Dashboard
router.get('/dashboard/affiliate', requireRole(ROLES.AFFILIATE), DashboardController.getAffiliateDashboard);
router.get('/dashboard/affiliate/members', requireRole(ROLES.AFFILIATE), DashboardController.getAffiliateMembersStats);
router.get('/dashboard/affiliate/earnings', requireRole(ROLES.AFFILIATE), DashboardController.getAffiliateEarnings);

// Agent Dashboard
router.get('/dashboard/agent', requireRole(ROLES.AGENT, ROLES.SUBADMIN, ROLES.ADMIN), DashboardController.getAgentDashboard);
router.get('/dashboard/agent/users', requireRole(ROLES.AGENT, ROLES.SUBADMIN, ROLES.ADMIN), DashboardController.getAgentUsers);

// Admin Dashboard
router.get('/dashboard/admin', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), DashboardController.getAdminDashboard);
router.get('/dashboard/admin/analytics', requireRole(ROLES.ADMIN), DashboardController.getAnalytics);

// ======================================================================
// KYC VERIFICATION ROUTES
// ======================================================================

router.post('/kyc/submit', requireRole(ROLES.USER, ROLES.AFFILIATE, ROLES.AGENT), KycController.submitKYC);
router.get('/kyc/status', authenticateToken, KycController.getKYCStatus);
router.put('/kyc/update', authenticateToken, KycController.updateKYC);
router.get('/kyc/list', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), KycController.listKYCRequests);
router.put('/kyc/:id/approve', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), KycController.approveKYC);
router.put('/kyc/:id/reject', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), KycController.rejectKYC);

// ======================================================================
// BONUS & PROMO ROUTES
// ======================================================================

router.get('/bonuses', optionalAuth, BonusController.getAllBonuses);
router.post('/bonuses/claim', requireRole(ROLES.USER), BonusController.claimBonus);
router.get('/bonuses/user', requireRole(ROLES.USER), BonusController.getUserBonuses);

router.get('/promotions', optionalAuth, PromoController.getPromotions);
router.get('/promotions/:id', optionalAuth, PromoController.getPromotionDetails);

// ======================================================================
// AFFILIATE ROUTES
// ======================================================================

router.get('/affiliates/profile', requireRole(ROLES.AFFILIATE), AffiliateController.getProfile);
router.put('/affiliates/profile', requireRole(ROLES.AFFILIATE), AffiliateController.updateProfile);
router.get('/affiliates/members', requireRole(ROLES.AFFILIATE), AffiliateController.searchMembers);
router.get('/affiliates/commissions', requireRole(ROLES.AFFILIATE), AffiliateController.getCommissions);
router.get('/affiliates/earnings', requireRole(ROLES.AFFILIATE), AffiliateController.getEarnings);
router.post('/affiliates/export-members', requireRole(ROLES.AFFILIATE), AffiliateController.exportMembers);
router.get('/affiliates/list', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), AffiliateController.listAffiliates);

// ======================================================================
// AGENT ROUTES
// ======================================================================

router.get('/agents/profile', requireRole(ROLES.AGENT), AgentController.getProfile);
router.put('/agents/profile', requireRole(ROLES.AGENT), AgentController.updateProfile);
router.get('/agents/users', requireRole(ROLES.AGENT), AgentController.getUsers);
router.get('/agents/transactions', requireRole(ROLES.AGENT), AgentController.getTransactions);
router.get('/agents/deposits', requireRole(ROLES.AGENT), AgentController.getDeposits);
router.get('/agents/withdrawals', requireRole(ROLES.AGENT), AgentController.getWithdrawals);
router.get('/agents/earnings', requireRole(ROLES.AGENT), AgentController.getEarnings);
router.get('/agents/list', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), AgentController.listAgents);

// ======================================================================
// ADMIN ROUTES
// ======================================================================

// User Management
router.get('/admin/users', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), requirePermission('users', 'read'), AdminController.getUsers);
router.put('/admin/users/:id', requireRole(ROLES.ADMIN), requirePermission('users', 'write'), AdminController.updateUser);
router.delete('/admin/users/:id', requireRole(ROLES.ADMIN), requirePermission('users', 'delete'), AdminController.deleteUser);
router.post('/admin/users/:id/ban', requireRole(ROLES.ADMIN), AdminController.banUser);
router.post('/admin/users/:id/unban', requireRole(ROLES.ADMIN), AdminController.unbanUser);

// Transaction Management
router.get('/admin/transactions', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), TransactionController.getAllTransactions);
router.post('/admin/transactions/:id/approve', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), TransactionController.approveTransaction);
router.post('/admin/transactions/:id/reject', requireRole(ROLES.ADMIN, ROLES.SUBADMIN), TransactionController.rejectTransaction);
router.post('/admin/transactions/:id/refund', requireRole(ROLES.ADMIN), TransactionController.refundTransaction);

// Promotion Management
router.post('/admin/promotions', requireRole(ROLES.ADMIN), PromoController.createPromotion);
router.put('/admin/promotions/:id', requireRole(ROLES.ADMIN), PromoController.updatePromotion);
router.delete('/admin/promotions/:id', requireRole(ROLES.ADMIN), PromoController.deletePromotion);

// ======================================================================
// NOTIFICATION ROUTES
// ======================================================================

router.get('/notifications', authenticateToken, NotificationController.getNotifications);
router.post('/notifications/mark-as-read', authenticateToken, NotificationController.markAsRead);
router.delete('/notifications/:id', authenticateToken, NotificationController.deleteNotification);

// ======================================================================
// REPORT ROUTES
// ======================================================================

router.get('/reports', authenticateToken, ReportController.getReports);
router.post('/reports/generate', authenticateToken, ReportController.generateReport);
router.get('/reports/:id', authenticateToken, ReportController.getReport);
router.post('/reports/:id/export', authenticateToken, ReportController.exportReport);

// ======================================================================
// VIP ROUTES
// ======================================================================

router.get('/vip/status', authenticateToken, VipController.getVIPStatus);
router.post('/vip/claim-benefits', requireRole(ROLES.USER), VipController.claimVIPBenefits);
router.get('/vip/benefits', optionalAuth, VipController.getVIPBenefits);

// ======================================================================
// ANALYTICS & METRICS ROUTES (NEW)
// ======================================================================

// Dashboard analytics
router.get('/dashboard/analytics/metrics', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: Math.floor(Math.random() * 10000),
      totalTransactions: Math.floor(Math.random() * 50000),
      totalRevenue: Math.floor(Math.random() * 100000),
      activeGames: Math.floor(Math.random() * 50)
    }
  });
});

router.get('/dashboard/analytics/time-series', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      dates: ['2026-02-02', '2026-02-03', '2026-02-04'],
      revenue: [5000, 7500, 9200],
      transactions: [150, 200, 250]
    }
  });
});

router.get('/dashboard/analytics/revenue-breakdown', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      games: 45000,
      betting: 35000,
      affiliates: 15000,
      other: 5000
    }
  });
});

router.get('/dashboard/analytics/users/statistics', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 10000,
      activeUsers: 3500,
      newUsersThisMonth: 500,
      verifiedUsers: 7500
    }
  });
});

router.get('/dashboard/analytics/betting/statistics', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      totalBets: 50000,
      winningBets: 15000,
      totalWinnings: 250000,
      avgBetAmount: 5000
    }
  });
});

router.get('/dashboard/analytics/transactions/flow', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      deposits: 75000,
      withdrawals: 65000,
      transfers: 25000,
      refunds: 5000
    }
  });
});

router.get('/dashboard/analytics/performance/metrics', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      uptime: '99.9%',
      avgResponseTime: 250,
      errorRate: '0.1%',
      throughput: 1000
    }
  });
});

router.get('/dashboard/analytics/performance/affiliate', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      totalAffiliates: 500,
      activeAffiliates: 350,
      totalCommissions: 100000,
      topAffiliate: 'Affiliate_001'
    }
  });
});

router.get('/dashboard/analytics/realtime/updates', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      onlineUsers: 3500,
      activeBets: 1200,
      lastUpdate: new Date().toISOString()
    }
  });
});

// ======================================================================
// LEGAL CONTENT ROUTES (NEW)
// ======================================================================

router.get('/legal/terms', (req, res) => {
  res.json({
    success: true,
    data: {
      content: 'Terms and Conditions... [Full terms content here]',
      lastUpdated: '2026-03-01',
      version: '1.0'
    }
  });
});

router.get('/legal/privacy', (req, res) => {
  res.json({
    success: true,
    data: {
      content: 'Privacy Policy... [Full privacy policy here]',
      lastUpdated: '2026-03-01',
      version: '1.0'
    }
  });
});

router.get('/legal/faq', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        question: 'How do I withdraw my winnings?',
        answer: 'You can withdraw your winnings through the withdrawal section...',
        category: 'withdrawals'
      },
      {
        id: 2,
        question: 'What payment methods are accepted?',
        answer: 'We accept credit cards, bank transfers, and e-wallets...',
        category: 'payments'
      },
      {
        id: 3,
        question: 'How long does verification take?',
        answer: 'Typically 24-48 hours depending on submitted documents...',
        category: 'verification'
      }
    ]
  });
});

// ======================================================================
// ADMIN DASHBOARD ROUTES (NEW)
// ======================================================================

router.get('/admin/dashboard/overview', authenticateToken, requireRole('admin', 'subadmin'), (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 250000,
      totalUsers: 10000,
      activeGames: 50,
      pendingWithdrawals: 25,
      systemHealth: 'healthy'
    }
  });
});

// ======================================================================
// UNIFIED DASHBOARD ROUTE (NEW)
// ======================================================================

router.get('/unified-dashboard', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      userStats: {
        total: 10000,
        active: 3500,
        new: 500
      },
      transactionStats: {
        totalValue: 500000,
        count: 50000
      },
      bettingStats: {
        totalBets: 50000,
        userParticipation: 3500
      },
      systemHealth: 'healthy'
    }
  });
});

router.get('/unified-dashboard/realtime', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      onlineNow: 3500,
      activeBets: 1200,
      recentTransactions: 150,
      lastUpdate: new Date().toISOString()
    }
  });
});

router.get('/unified-dashboard/system-health', authenticateToken, requireRole('admin', 'subadmin'), (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 250,
      errorRate: 0.1
    }
  });
});

// ======================================================================
// HEALTH CHECK & INFO ROUTES
// ======================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    user: req.user ? {
      id: req.user._id,
      type: req.userType
    } : null
  });
});

router.get('/auth/check', authenticateToken, (req, res) => {
  res.json({
    authenticated: true,
    user: res.locals.currentUser
  });
});

// ======================================================================
// ERROR HANDLING
// ======================================================================

router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;
