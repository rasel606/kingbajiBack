// src/router/deviceAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const DeviceAnalyticsController = require('../controllers/DeviceAnalyticsController');

// ডিভাইস/সেশন অ্যানালিটিক্স
router.get('/user-device-stats', DeviceAnalyticsController.getUserDeviceStats);
// suspicious session detection
router.get('/suspicious-session', DeviceAnalyticsController.checkSuspiciousSession);
// audit log fetch
router.get('/user-audit-logs', DeviceAnalyticsController.getUserAuditLogs);

module.exports = router;
