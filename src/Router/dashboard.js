// routes/dashboard.js
const express = require('express');
const { getAffiliateDashboard } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAffiliateDashboard);

module.exports = router;