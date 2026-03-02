// src/router/realtimeSecurityRoutes.js
const express = require('express');
const router = express.Router();
const RealtimeSecurityController = require('../controllers/RealtimeSecurityController');

// Realtime security alerts
router.get('/alerts', RealtimeSecurityController.realtimeAlerts);
// Admin force logout
router.post('/force-logout', RealtimeSecurityController.forceLogout);
// Admin device ban/block
router.post('/device-ban', RealtimeSecurityController.deviceBan);

module.exports = router;
