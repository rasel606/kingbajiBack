const express = require('express');
const router = express.Router();

// Local import controllers
const DashboardController = require('../controllers/DashboardController');

// Auth middleware (adjust path if needed)
const adminAuth = require('./adminAuth');

// Dashboard routes
router.get('/advanced', adminAuth, DashboardController.getAdvancedDashboard);
router.get('/unified', adminAuth, DashboardController.getUnifiedDashboard);
router.get('/realtime', adminAuth, DashboardController.getRealtimeStats);
router.get('/providers', adminAuth, DashboardController.getProviderStats);
router.get('/timeseries', adminAuth, DashboardController.getTimeSeriesData);

module.exports = router;

