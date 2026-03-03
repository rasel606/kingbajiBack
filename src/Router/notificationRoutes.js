// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../Controllers/notificationController');
const {auth} = require('../middleWare/auth');
const validate = require('../middleWare/validation');

// Get user notifications
router.get('/user/:userId', auth, NotificationController.getGroupedNotifications);

// // Mark notification as read
// router.put('/:notificationId/read', auth, NotificationController.markAsRead);

// Mark all as read
router.put('/user/:userId/read-all', auth, NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, NotificationController.deleteNotification);

// Get notification preferences
router.get('/preferences/:userId', auth, NotificationController.getPreferences);

// Update preferences
router.put('/preferences/:userId', auth, NotificationController.updatePreferences);

// Send push notification (admin only)
router.post('/send-push', auth, NotificationController.sendPushNotification);

module.exports = router;