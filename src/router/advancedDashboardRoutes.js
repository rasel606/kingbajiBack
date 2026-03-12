// Advanced Dashboard Routes
const express = require('express');
const router = express.Router();
const DashboardAnalyticsController = require('../controllers/DashboardAnalyticsController');
const { auth } = require('../middleWare/auth');
const adminAuth = require('../middleWare/adminAuth');

// ⚡ OPTIMIZED: Single combined endpoint for all dashboard data
router.get('/summary', adminAuth, DashboardAnalyticsController.getOptimizedSummary);

// Public metrics (can be cached)
router.get('/metrics', adminAuth, DashboardAnalyticsController.getDashboardMetrics);
router.get('/time-series', adminAuth, DashboardAnalyticsController.getTimeSeriesData);
router.get('/revenue-breakdown', adminAuth, DashboardAnalyticsController.getRevenueBreakdown);

// User analytics
router.get('/users/statistics', adminAuth, DashboardAnalyticsController.getUserStatistics);
router.get('/users/geographical', adminAuth, DashboardAnalyticsController.getUsersByCountry);

// Betting analytics
router.get('/betting/statistics', adminAuth, DashboardAnalyticsController.getBettingStatistics);
router.get('/betting/by-game', adminAuth, DashboardAnalyticsController.getBetsByGame);

// Transaction analytics
router.get('/transactions/flow', adminAuth, DashboardAnalyticsController.getTransactionFlow);
router.get('/transactions/export', adminAuth, DashboardAnalyticsController.exportDashboardData);

// Performance metrics
router.get('/performance/metrics', adminAuth, DashboardAnalyticsController.getPerformanceMetrics);
router.get('/performance/affiliate', adminAuth, DashboardAnalyticsController.getAffiliatePerformance);

// Real-time data
router.get('/realtime/updates', adminAuth, DashboardAnalyticsController.getRealtimeUpdates);

// Export functionality
router.get('/export', adminAuth, DashboardAnalyticsController.exportDashboardData);

module.exports = router;
