const express = require('express');
const {
  getEarningsData,
  refreshEarningsData,
  getRevenueData,
  getCacheStats,
  clearCache
} = require('../Controllers/AffiliateEarningsController');
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');

const router = express.Router();

router.use(protectAffiliate);

router.get('/', getEarningsData);
router.get('/revenue', getRevenueData);
router.post('/refresh', refreshEarningsData);
router.get('/cache/stats', getCacheStats);
router.post('/cache/clear', clearCache);

module.exports = router;