// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { dailyWagerReport } = require('../controllers/reportController');

router.get('/daily-wager', dailyWagerReport);

module.exports = router;
