const express = require('express');
const router = express.Router();
const { 
  getReferralDashboard,
  getReferralHistory,
  claimReferralBonus
} = require('../controllers/newReferralController');
const { auth } = require('../middleWare/auth');

// Protected routes
router.get('/dashboard', auth, getReferralDashboard);
router.get('/history', auth, getReferralHistory);
router.post('/claim/:bonusId', auth, claimReferralBonus);

module.exports = router;