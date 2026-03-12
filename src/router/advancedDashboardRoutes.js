// Advanced Dashboard Routes
const express = require('express');
const router = express.Router();
const DashboardAnalyticsController = require('../controllers/DashboardAnalyticsController');
const { auth } = require('../middleWare/auth');
const AdminAuth = require('../middleWare/AdminAuth');

// ⚡ OPTIMIZED: Single combined endpoint for all dashboard data
router.get('/summary', AdminAuth, DashboardAnalyticsController.getOptimizedSummary);

// Public metrics (can be cached)
router.get('/metrics', AdminAuth, DashboardAnalyticsController.getDashboardMetrics);
router.get('/time-series', AdminAuth, DashboardAnalyticsController.getTimeSeriesData);
router.get('/revenue-breakdown', AdminAuth, DashboardAnalyticsController.getRevenueBreakdown);

// User analytics
router.get('/users/statistics', AdminAuth, DashboardAnalyticsController.getUserStatistics);
router.get('/users/geographical', AdminAuth, DashboardAnalyticsController.getUsersByCountry);

// Betting analytics
router.get('/betting/statistics', AdminAuth, DashboardAnalyticsController.getBettingStatistics);
router.get('/betting/by-game', AdminAuth, DashboardAnalyticsController.getBetsByGame);

// Transaction analytics
router.get('/transactions/flow', AdminAuth, DashboardAnalyticsController.getTransactionFlow);
router.get('/transactions/export', AdminAuth, DashboardAnalyticsController.exportDashboardData);

// Performance metrics
router.get('/performance/metrics', AdminAuth, DashboardAnalyticsController.getPerformanceMetrics);
router.get('/performance/affiliate', AdminAuth, DashboardAnalyticsController.getAffiliatePerformance);

// Real-time data
router.get('/realtime/updates', AdminAuth, DashboardAnalyticsController.getRealtimeUpdates);

// Export functionality
router.get('/export', AdminAuth, DashboardAnalyticsController.exportDashboardData);

module.exports = router;
