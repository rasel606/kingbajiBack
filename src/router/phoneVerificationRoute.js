// routes/phoneVerification.js
const express = require('express');

const phoneVerificationService = require('../services/PhoneVerificationService');
const {auth} = require('../MiddleWare/auth');
const { validatePhoneNumber, validateVerificationCode } = require('../MiddleWare/mainValidation');

// All routes are protected
const router = express.Router();

// Send verification code
router.post('/verification/send',auth,  phoneVerificationService.sendVerificationCode);

// Verify code
router.post('/verification/verify',auth,  validateVerificationCode, phoneVerificationService.verifyCode);

// Resend verification code
router.post('/verification/resend',auth, phoneVerificationService.resendVerificationCode);

module.exports = router;