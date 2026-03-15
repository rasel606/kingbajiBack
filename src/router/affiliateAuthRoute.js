// routes/auth.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/AffiliateAuthControllers');
const { protectAffiliate } = require('../middleWare/affiliateAuth');
const authLimiter = require('../middleWare/rateLimiter');
const validate = require('../middleWare/validation');
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


router.post('/register', authLimiter, validate,
  (req, res, next) => {
    console.log("req", req.body)
    next();
  },
  register
);

router.post('/login', authLimiter, [
  body('userId')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate, login);
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