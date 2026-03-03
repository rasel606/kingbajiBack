// // Backend/src/Router/emailVerificationRoutes.js
// const express = require('express');
// const emailVerificationService = require('../Services/emailVerificationService');
// const { auth } = require('../middleware/auth');
// const { validateEmail, validateVerificationCode } = require('../middleware/mainValidation');

// // All routes are protected
// const router = express.Router();

// // Send verification code
// router.post('/verification/send', auth, validateEmail, emailVerificationService.sendVerificationCode);

// // Verify code
// router.post('/verification/verify', auth, validateVerificationCode, emailVerificationService.verifyCode);

// // Resend verification code
// router.post('/verification/resend', auth, validateEmail, emailVerificationService.resendVerificationCode);

// module.exports = router;


// routes/emailVerificationRoutes.js
const express = require('express');
const router = express.Router();

const emailVerificationService = require('../Services/emailVerificationService');
const { auth } = require('../middleware/auth');
const { validateEmail, validateVerificationCode } = require('../middleware/mainValidation');

// Send verification code
router.post(
  '/verification/send',
  auth,
  validateEmail,
  emailVerificationService.sendVerificationCode.bind(emailVerificationService)
);

// Verify code
router.post(
  '/verification/verify',
  auth,
  validateVerificationCode,
  emailVerificationService.verifyCode.bind(emailVerificationService)
);

// Resend verification code
router.post(
  '/verification/resend',
  auth,
  validateEmail,
  emailVerificationService.resendVerificationCode.bind(emailVerificationService)
);

module.exports = router;
