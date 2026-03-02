// src/router/dashboardReportRoutes.js
const express = require('express');
const router = express.Router();
const DashboardReportController = require('../controllers/DashboardReportController');

// Custom summary report
router.get('/summary', DashboardReportController.summaryReport);
// Realtime dashboard
router.get('/realtime', DashboardReportController.realtimeDashboard);

module.exports = router;
