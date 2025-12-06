const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/AgentDashboard');
const auth = require('../MiddleWare/subAdminAuth');

// All dashboard routes require authentication


// Dashboard statistics
router.get('/stats',auth, dashboardController.getDashboardStats);

// Recent activity
router.get('/recent-activity',auth, dashboardController.getRecentActivity);

// User management
router.get('/users/list',auth, dashboardController.getUserList);
router.get('/users/agents',auth, dashboardController.getAgentList);
router.get('/users/subagents',auth, dashboardController.getSubAgentList);

// Transaction management
router.get('/transactions/pending-deposits',auth, dashboardController.getPendingDeposits);
router.get('/transactions/pending-withdrawals',auth, dashboardController.getPendingWithdrawals);
router.get('/transactions/recent',auth, dashboardController.getRecentTransactions);

module.exports = router;