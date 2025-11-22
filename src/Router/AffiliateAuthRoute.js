// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('../Controllers/AffiliateAuthControllers');
const { protectAffiliate } = require('../MiddleWare/affiliateAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

router.post('/register', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('dateOfBirth')
    .isDate()
    .withMessage('Valid date of birth is required')
], validate, register);

router.post('/login', [
  body('userId')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate, login

);
console.log("login",login)
router.get('/me',
  protectAffiliate,
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }
    next();
  },
   getMe);
router.put('/password', protectAffiliate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], validate, changePassword);

module.exports = router;