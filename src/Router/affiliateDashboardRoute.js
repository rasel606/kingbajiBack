// routes/dashboard.js
const express = require('express');
const { getAffiliateDashboard } = require('../Controllers/AffiliateDashboardController');
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');

const router = express.Router();

router.get('/', protectAffiliate, getAffiliateDashboard);

module.exports = router;