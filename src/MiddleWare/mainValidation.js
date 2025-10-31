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

const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

module.exports = {
  validatePhoneNumber,
  validateVerificationCode,
  validateRegistration
};