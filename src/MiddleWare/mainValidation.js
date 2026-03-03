// middleware/validation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validatePhoneNumber = [
  body('phone_number')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateVerificationCode = [
  body('verification_code')
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('Verification code must be 4 digits'),
  handleValidationErrors
];


const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }
    next();
  }
];
const validateRegistration = (data) => {
  const errors = [];

  if (!data.userId || data.userId.length < 3) {
    errors.push('User ID must be at least 3 characters long');
  }

  if (!data.phone || !/^\d{10,15}$/.test(data.phone)) {
    errors.push('Valid phone number is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!data.countryCode || !/^\+\d{1,4}$/.test(data.countryCode)) {
    errors.push('Valid country code is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLogin = (data) => {
  const errors = [];

  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


module.exports = {
  validatePhoneNumber,
  validateVerificationCode,
  validateRegistration,
  validateLogin,
  validateEmail
};