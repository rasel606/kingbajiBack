// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const auth = require('../MiddleWare/AdminAuth');
const validate = require('../MiddleWare/validation');
const AppError = require('../utils/appError');
const router = express.Router();

router.post('/register_admin', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], validate,  AdminController.CreateAdmin);

router.post('/login_admin', [
  body('email')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
],validate,  AdminController.AdminLogin);

router.get('/main_admin',
  auth,
   AdminController.GetAdminProfile);


// router.get('/sessions/active', adminAuthMiddleware, AdminController.GetActiveAdminSessions);

// router.post('/force-logout/admin/:userId', adminAuthMiddleware,   AdminController.ForceLogoutAdmin);



module.exports = router;