// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../Controllers/paymentMethodController');
const {auth} = require('../MiddleWare/auth');
router.post('/user', paymentMethodController.GetPaymentMethodsUser);
router.post('/all-levels', paymentMethodController.GetPaymentMethodsForAllLevels);
router.post('/by-level', paymentMethodController.GetPaymentMethodsByLevel);
router.post('/network-stats', paymentMethodController.GetReferralNetworkStats);
router.post('/direct-owners', paymentMethodController.GetDirectDepositOwners);
router.get('/direct-owners-user',auth, paymentMethodController.getPaymentMethodsController);
module.exports = router;