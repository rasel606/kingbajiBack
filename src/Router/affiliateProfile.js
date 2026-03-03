// routes/profile.js
const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  requestVerificationCode,
  verifyContact
} = require('../Controllers/AffiliateProfileController');
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

router.use(protectAffiliate);

router.get('/', getProfile);
router.put('/updateProfile', [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required')
], validate, updateProfile);

router.post('/verify/request', [
  body('contactType')
    .isIn(['phone', 'email'])
    .withMessage('Valid contact type is required'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
], validate, requestVerificationCode);

router.post('/verify', [
  body('contactType')
    .isIn(['phone', 'email'])
    .withMessage('Valid contact type is required'),
  body('code')
    .isLength({ min: 4, max: 6 })
    .withMessage('Verification code must be 4-6 digits')
], validate, verifyContact);

module.exports = router;