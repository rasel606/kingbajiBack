const express = require('express');
const {
  getEarningsData,
  refreshEarningsData
} = require('../Controllers/AffiliateEarningsController');
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');

const router = express.Router();

router.use(protectAffiliate);

router.get('/', getEarningsData);
router.post('/refresh', refreshEarningsData);

module.exports = router;