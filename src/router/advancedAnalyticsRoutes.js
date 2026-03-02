// src/router/advancedAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const AdvancedAnalyticsController = require('../controllers/AdvancedAnalyticsController');

// Geo heatmap
router.get('/geo-heatmap', AdvancedAnalyticsController.geoHeatmap);
// Device breakdown
router.get('/device-breakdown', AdvancedAnalyticsController.deviceBreakdown);
// Session timeline
router.get('/session-timeline', AdvancedAnalyticsController.sessionTimeline);

module.exports = router;
