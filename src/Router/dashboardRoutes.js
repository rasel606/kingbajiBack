// routes/subAdminRoutes.js
const express = require('express');
const { body } = require('express-validator');
const SubAdminControllers = require('../Controllers/AdminController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard_stats', auth, SubAdminControllers.getAdminDashboardStats);

// // Search rejected deposit transactions
// router.post('/search-deposit-reject', [
//   body('referredBy')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.searchDepositTransactionsReportreject);

// Search approved deposit transactions
// router.post('/search-deposit-approve', [
//   body('referredBy')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.searchDepositTransactionsReportAprove);

// Get deposit totals
// router.post('/deposit-totals', [
//   body('referredBy')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.getTransactionDepositTotals);

// Get all users for sub-admin
// router.post('/users', [
//   body('referredBy')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.getUsersForSubAdmin);

module.exports = router;
