// Advanced Dashboard Routes
const express = require('express');
const router = express.Router();
const DashboardAnalyticsController = require('../controllers/DashboardAnalyticsController');
const { auth } = require('../middleWare/auth');
const adminAuth = require('../middleWare/adminAuth');

// ⚡ OPTIMIZED: Single combined endpoint for all dashboard data
router.get('/summary', auth, DashboardAnalyticsController.getOptimizedSummary);

// Public metrics (can be cached)
router.get('/metrics', auth, DashboardAnalyticsController.getDashboardMetrics);
router.get('/time-series', auth, DashboardAnalyticsController.getTimeSeriesData);
router.get('/revenue-breakdown', auth, DashboardAnalyticsController.getRevenueBreakdown);

// User analytics
router.get('/users/statistics', auth, DashboardAnalyticsController.getUserStatistics);
router.get('/users/geographical', auth, DashboardAnalyticsController.getUsersByCountry);

// Betting analytics
router.get('/betting/statistics', auth, DashboardAnalyticsController.getBettingStatistics);
router.get('/betting/by-game', auth, DashboardAnalyticsController.getBetsByGame);

// Transaction analytics
router.get('/transactions/flow', auth, DashboardAnalyticsController.getTransactionFlow);
router.get('/transactions/export', auth, adminAuth, DashboardAnalyticsController.exportDashboardData);

// Performance metrics
router.get('/performance/metrics', auth, DashboardAnalyticsController.getPerformanceMetrics);
router.get('/performance/affiliate', auth, DashboardAnalyticsController.getAffiliatePerformance);

// Real-time data
router.get('/realtime/updates', auth, DashboardAnalyticsController.getRealtimeUpdates);

// Export functionality
router.get('/export', auth, adminAuth, DashboardAnalyticsController.exportDashboardData);

module.exports = router;
