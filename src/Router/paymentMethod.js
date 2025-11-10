// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../Controllers/paymentMethodController');

router.post('/user', paymentMethodController.GetPaymentMethodsUser);
router.post('/all-levels', paymentMethodController.GetPaymentMethodsForAllLevels);
router.post('/by-level', paymentMethodController.GetPaymentMethodsByLevel);
router.post('/network-stats', paymentMethodController.GetReferralNetworkStats);
router.post('/direct-owners', paymentMethodController.GetDirectDepositOwners);
module.exports = router;