const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/widgetController');

// Public widget endpoints (no auth)
router.get('/active', widgetController.getActiveWidgets);
router.post('/track', widgetController.trackWidgetInteraction);

module.exports = router;
