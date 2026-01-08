// const express = require('express');
// const router = express.Router();
// const { 
//   getReferralDashboard,
//   getReferralHistory,
//   claimReferralBonus
// } = require('../controllers/newReferralController');
// const { auth } = require('../middleWare/auth');

// // Protected routes
// router.get('/dashboard', auth, getReferralDashboard);
// router.get('/history', auth, getReferralHistory);
// router.post('/claim/:bonusId', auth, claimReferralBonus);

// module.exports = router;


const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const {auth }= require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get referral dashboard
router.get('/dashboard',auth, referralController.getDashboard);

// Get referral details with filters
router.get('/details', referralController.getDetails);

// Claim bonus
router.post('/claim', referralController.claimBonus);

// Get referral requirements
router.get('/requirements', referralController.getRequirements);

// Get commission table
router.get('/commission-table', referralController.getCommissionTable);

// Get monthly achievements
router.get('/achievements', referralController.getAchievements);

module.exports = router;