const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/TransactionController');
const AdminAuth = require('../middleWare/AdminAuth');
const AdminController = require('../controllers/AdminController');

// Admin routes - deposit/withdrawal search
router.get('/deposits/search', AdminAuth, transactionController.searchDeposits);
router.get('/withdrawals/search', AdminAuth, transactionController.searchWithdrawals);
router.post('/deposits/:id/approve', AdminAuth, transactionController.approveDeposit);
router.post('/deposits/:id/reject', AdminAuth, transactionController.rejectDeposit);
router.post('/withdrawals/:id/approve', AdminAuth, transactionController.approveWithdrawal);
router.post('/withdrawals/:id/reject', AdminAuth, transactionController.rejectWithdrawal);

// Deposit gateway search (fixes 404 for /api/transactions/search_deposit_getways)
router.get('/search_deposit_getways', AdminAuth, AdminController.subAdminGetWayList);

// User routes
router.post('/deposit/submit', transactionController.submitDeposit);
router.post('/withdrawal/submit', transactionController.submitWithdrawal);

module.exports = router;

