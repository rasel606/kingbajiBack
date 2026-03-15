const express = require('express');
const {
  getRevenueData
} = require('../services/AffiliateRevenueService');
const {protectAffiliate} = require('../middleWare/affiliateAuth');

const router = express.Router();

router.use(protectAffiliate);

router.get('/', getRevenueData);

module.exports = router;