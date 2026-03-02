const express = require('express');
const { getUpline, getDownline } = require('../Controllers/AffiliateHierarchyController');
const { protectAffiliate } = require('../middleWare/affiliateAuth');
const router = express.Router();

router.use(protectAffiliate);

router.get('/', getUpline);
router.get('/downline', getDownline);

module.exports = router;
