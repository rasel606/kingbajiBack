// routes/vipUserRoutes.js
const express = require('express');
const router = express.Router();
const VipUserController = require('../controllers/VipUserController');
const { auth } = require('../middleWare/auth'); // Your user auth middleware

// Get current user VIP data
router.get('/my-vip-data', auth, VipUserController.getMyVipData);

// Get VIP points records
router.get('/points-records', auth, VipUserController.getVipPointRecords);

// Get VIP history
router.get('/history', auth, VipUserController.getVipHistory);

// Convert points to real money
router.post('/convert-points', auth, VipUserController.convertVipPoints);

//? Get user's VIP history
router.get('/history', auth, VipUserController.getVipHistory);
router.get('/conversion-preview', auth, VipUserController.getConversionPreview);

// Get level benefits
router.get('/level-benefits', auth, VipUserController.getLevelBenefits);

module.exports = router;