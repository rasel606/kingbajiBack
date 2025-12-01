// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AgentController = require('../Controllers/AgentController');
const SubAgentController = require('../Controllers/SubAgentController');
const AffiliateAuthControllers = require('../Controllers/AffiliateAuthControllers');
const auth = require('../MiddleWare/AdminAuth');
const {register, loginUser} = require('../Controllers/AuthController');
const validate = require('../MiddleWare/validation');
const AppError = require('../Utils/AppError');
const router = express.Router();

router.post('/register_admin', validate, AdminController.CreateAdmin);

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

router.post('/register_Sub_admin', validate,SubAdminControllers.CreateAdmin);
router.post('/register_agent', validate,AgentController.AgentRegister);
router.post('/register_Sub_agent', validate,SubAgentController.SubAgentRegister);
router.post('/register_affiliate', validate,AffiliateAuthControllers.register);
router.post('/createUser', register);
// router.get('/sessions/active', adminAuthMiddleware, AdminController.GetActiveAdminSessions);

// router.post('/force-logout/admin/:userId', adminAuthMiddleware,   AdminController.ForceLogoutAdmin);



module.exports = router;