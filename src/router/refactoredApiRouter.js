/**
 * Refactored API Router
 * Combines all user-facing endpoints with DRY principles
 * Consistent error handling, validation, and response format
 * 
 * NOTE: Routes mounted at /api/v1 - don't add /v1 prefix to individual routes
 */

const express = require('express');
const router = express.Router();

// Import Controllers
const AuthController = require('../Controllers/AuthController');
const TransactionController = require('../Controllers/TransactionController');
const UserController = require('../controllers/UserController');
const CreateUserService = require('../services/CreateUserService');
const UpdateProfile = require('../Controllers/UpdateProfile');
const BettingController = require('../Controllers/BettingController');
const Refresh_blance = require('../Controllers/Refresh_blance');
const BankController = require('../Controllers/BankController');
const notificationController = require('../Controllers/notificationController');
const bettingHistoryController = require('../Controllers/bettingHistoryController');
const ModelBettingController = require('../Controllers/modelBettingController');
const AdminController = require('../controllers/AdminController');

// Import Middleware
const { auth } = require('../middleWare/auth');

// Import Validators
const { 
  validateUserRegistration,
  validateLogin,
  validateDepositRequest,
  validateWithdrawalRequest
} = require('../utils/enhancedValidators');

// Import Response Helpers
const { 
  sendSuccess, 
  sendError, 
  sendValidationError,
  sendUnauthorized,
  sendNotFound
} = require('../utils/responseHelper');

// Import CatchAsync
const catchAsync = require('../utils/catchAsync');

/**
 * =====================================================
 * AUTHENTICATION ROUTES
 * =====================================================
 */

// POST /api/v1/register - User registration
router.post('/register', catchAsync(async (req, res, next) => {
  return AuthController.register(req, res);
}));

// POST /api/v1/login - User login
router.post('/login', catchAsync(async (req, res, next) => {
  return AuthController.loginUser(req, res);
}));

// POST /api/v1/logout - User logout
router.post('/logout', auth, catchAsync(async (req, res, next) => {
  return AuthController.logout(req, res);
}));

// GET /api/v1/profile - Get current user profile
router.get('/profile', auth, catchAsync(async (req, res, next) => {
  return AuthController.getProfile(req, res);
}));

// POST /api/v1/change-password - Change user password
router.post('/change-password', auth, catchAsync(async (req, res, next) => {
  return AuthController.changePassword(req, res);
}));

// POST /api/v1/forgot-password - Request password reset
router.post('/forgot-password', catchAsync(async (req, res, next) => {
  return AuthController.forgotPassword(req, res);
}));

// POST /api/v1/reset-password - Reset password with token
router.post('/reset-password', catchAsync(async (req, res, next) => {
  return AuthController.resetPassword(req, res);
}));

// GET /api/v1/refresh-token - Refresh auth token
router.get('/refresh-token', auth, catchAsync(async (req, res, next) => {
  return AuthController.refreshToken(req, res);
}));

/**
 * =====================================================
 * USER PROFILE ROUTES
 * =====================================================
 */

// GET /api/v1/user-details - Get user details
router.get('/user-details', auth, catchAsync(async (req, res, next) => {
  return CreateUserService.userDetails(req, res);
}));

// PUT /api/v1/profile/name - Update user name
router.put('/profile/name', auth, catchAsync(async (req, res, next) => {
  return UpdateProfile.updateName(req, res);
}));

// PUT /api/v1/profile/birthday - Update user birthday
router.put('/profile/birthday', auth, catchAsync(async (req, res, next) => {
  return UpdateProfile.verifyBirthday(req, res);
}));

// PUT /api/v1/profile - Update full profile
router.put('/profile', auth, catchAsync(async (req, res, next) => {
  const userId = req.user.userId;
  const result = await UserController.updateUserProfileById(
    { ...req, params: { userId } },
    require('../models/User'),
    req.user
  );
  return res.status(200).json(result);
}));

/**
 * =====================================================
 * TRANSACTION ROUTES - DEPOSITS
 * =====================================================
 */

// POST /api/v1/deposit - Submit deposit request
router.post('/deposit', auth, catchAsync(async (req, res, next) => {
  return TransactionController.submitTransaction(req, res);
}));

// GET /api/v1/deposits - Get deposit list
router.get('/deposits', auth, catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { userId: req.user.userId, type: 0 };
  if (status !== undefined) query.status = parseInt(status);
  
  const deposits = await require('../models/TransactionModel')
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await require('../models/TransactionModel').countDocuments(query);
  
  return sendSuccess(res, { deposits, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total } }, 'Deposits fetched successfully');
}));

// POST /api/v1/deposit/approve/:transactionID - Approve deposit
router.post('/deposit/approve/:transactionID', auth, catchAsync(async (req, res, next) => {
  return TransactionController.approveDepositbySubAdmin(req, res);
}));

/**
 * =====================================================
 * TRANSACTION ROUTES - WITHDRAWALS
 * =====================================================
 */

// POST /api/v1/withdraw - Submit withdrawal request
router.post('/withdraw', auth, catchAsync(async (req, res, next) => {
  return TransactionController.WithdrawTransaction(req, res);
}));

// GET /api/v1/withdrawals - Get withdrawal list
router.get('/withdrawals', auth, catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { userId: req.user.userId, type: 1 };
  if (status !== undefined) query.status = parseInt(status);
  
  const withdrawals = await require('../models/TransactionModel')
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await require('../models/TransactionModel').countDocuments(query);
  
  return sendSuccess(res, { withdrawals, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total } }, 'Withdrawals fetched successfully');
}));

// POST /api/v1/withdrawal/approve/:transactionID - Approve withdrawal
router.post('/withdrawal/approve/:transactionID', auth, catchAsync(async (req, res, next) => {
  return TransactionController.approveWidthdrawBySubAdmin(req, res);
}));

/**
 * =====================================================
 * TRANSACTION ROUTES - HISTORY & STATS
 * =====================================================
 */

// GET /api/v1/transactions - Get all transactions
router.get('/transactions', auth, catchAsync(async (req, res, next) => {
  return TransactionController.searchTransactionsbyUserId(req, res);
}));

// POST /api/v1/check-withdrawal-eligibility - Check withdrawal eligibility
router.post('/check-withdrawal-eligibility', auth, catchAsync(async (req, res, next) => {
  return TransactionController.checkWithdrawalEligibility(req, res);
}));

/**
 * =====================================================
 * PAYMENT METHODS
 * =====================================================
 */

// GET /api/v1/payment-methods/deposit - Get deposit payment methods
router.get('/payment-methods/deposit', auth, catchAsync(async (req, res, next) => {
  return TransactionController.GetPaymentMethodsUser(req, res);
}));

// GET /api/v1/payment-methods/withdraw - Get withdrawal payment methods
router.get('/payment-methods/withdraw', auth, catchAsync(async (req, res, next) => {
  return TransactionController.GetPaymentMethodsWidthrawUser(req, res);
}));

/**
 * =====================================================
 * BALANCE & WALLET
 * =====================================================
 */

// GET /api/v1/balance - Get user balance
router.get('/balance', auth, catchAsync(async (req, res, next) => {
  return Refresh_blance.refreshBalance(req, res);
}));

/**
 * =====================================================
 * BETTING & GAMES
 * =====================================================
 */

// GET /api/v1/games - Get all games
router.get('/games', catchAsync(async (req, res, next) => {
  return ModelBettingController.GetAllCategory(req, res);
}));

// GET /api/v1/games/featured - Get featured/hot games
router.get('/games/featured', catchAsync(async (req, res, next) => {
  return AdminController.GateAllGames(req, res);
}));

// GET /api/v1/games/category/:id - Get games by category
router.get('/games/category/:id', catchAsync(async (req, res, next) => {
  return ModelBettingController.ShowGameListById(req, res);
}));

// GET /api/v1/games/providers - Get all providers
router.get('/games/providers', catchAsync(async (req, res, next) => {
  return ModelBettingController.GetAllProvider(req, res);
}));

// POST /api/v1/games/search - Search games
router.post('/games/search', catchAsync(async (req, res, next) => {
  return ModelBettingController.searchGamesByName(req, res);
}));

// GET /api/v1/bets/history - Get betting history
router.get('/bets/history', auth, catchAsync(async (req, res, next) => {
  return bettingHistoryController.BettingRecordDetails(req, res);
}));

// GET /api/v1/bets/summary - Get betting summary
router.get('/bets/summary', auth, catchAsync(async (req, res, next) => {
  return bettingHistoryController.BettingRecordSummary(req, res);
}));

// GET /api/v1/daily-wager - Get daily wager
router.get('/daily-wager', auth, catchAsync(async (req, res, next) => {
  return require('../Controllers/MyController').getDailyWager(req, res);
}));

/**
 * =====================================================
 * BANKING
 * =====================================================
 */

// GET /api/v1/banks - Get available banks
router.get('/banks', catchAsync(async (req, res, next) => {
  return BankController.getBanks(req, res);
}));

/**
 * =====================================================
 * NOTIFICATIONS
 * =====================================================
 */

// GET /api/v1/notifications - Get user notifications
router.get('/notifications', auth, catchAsync(async (req, res, next) => {
  return notificationController.getGroupedNotifications(req, res);
}));

/**
 * =====================================================
 * VERIFICATION
 * =====================================================
 */

// POST /api/v1/send-phone-otp - Send phone verification OTP
router.post('/send-phone-otp', catchAsync(async (req, res, next) => {
  return CreateUserService.SendPhoneVerificationCode(req, res);
}));

// POST /api/v1/verify-phone - Verify phone with OTP
router.post('/verify-phone', catchAsync(async (req, res, next) => {
  return CreateUserService.verifyPhone(req, res);
}));

// GET /api/v1/verify-email - Send email verification
router.get('/verify-email', auth, catchAsync(async (req, res, next) => {
  return UpdateProfile.verifyOTP(req, res);
}));

/**
 * =====================================================
 * REFERRALS
 * =====================================================
 */

// GET /api/v1/referrals - Get referred users
router.get('/referrals', auth, catchAsync(async (req, res, next) => {
  return CreateUserService.getReferredUsers(req, res);
}));

/**
 * =====================================================
 * HEALTH CHECK
 * =====================================================
 */

// GET /api/v1/check - Health check endpoint
router.get('/check', auth, (req, res) => {
  res.status(200).json({ success: true, message: 'API is working', user: req.user });
});

// GET /api/v1/check-public - Public health check
router.get('/check-public', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working', timestamp: new Date().toISOString() });
});

module.exports = router;

