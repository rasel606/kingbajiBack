const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/TransactionController');
const adminAuth = require('./adminAuth'); // Assume existing admin auth middleware

// Admin routes - protect with adminAuth
router.get('/deposits/search', adminAuth, transactionController.searchDeposits);
router.get('/withdrawals/search', adminAuth, transactionController.searchWithdrawals);
router.post('/deposits/:id/approve', adminAuth, transactionController.approveDeposit);
router.post('/deposits/:id/reject', adminAuth, transactionController.rejectDeposit);
router.post('/withdrawals/:id/approve', adminAuth, transactionController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminAuth, transactionController.rejectWithdrawal);

// User routes (add auth later)
router.post('/deposit/submit', transactionController.submitDeposit); // Implement in controller later
router.post('/withdrawal/submit', transactionController.submitWithdrawal);

module.exports = router;

