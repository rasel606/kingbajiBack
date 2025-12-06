const express = require('express');
const {
  getCommissions,
  getDownlineCommissions,
  getCommissionDetails
} = require('../Controllers/AffiliateEarningsController');
const { protectAffiliate } = require('../MiddleWare/affiliateAuth');

const router = express.Router();

router.use(protectAffiliate);
router.get('/', getCommissions);
router.get('/downline', getDownlineCommissions);
router.get('/:commissionId', getCommissionDetails);

module.exports = router;