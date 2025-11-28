// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

router.post('/register_Sub_admin', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], validate,AdminController.CreateAdmin);

router.post('/login_admin', [
  body('email')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate,  AdminController.AdminLogin

);

router.get('/main_admin',
  auth,
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }
    next();
  },
   AdminController.GetAdminProfile);


module.exports = router;