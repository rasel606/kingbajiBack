// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AgentController = require('../controllers/AgentController');
const SubAgentController = require('../Controllers/SubAgentController');
const AffiliateAuthControllers = require('../Controllers/AffiliateAuthControllers');
const {register, loginUser} = require('../controllers/AuthController')
const validate = require('../middleWare/validation');
const AppError = require('../utils/AppError');
const AdminAuth = require('../middleWare/AdminAuth');
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
  AdminAuth,
   AdminController.GetAdminProfile);

router.post('/register_Sub_admin', validate,SubAdminControllers.CreateAdmin);
router.post('/register_agent', validate,AgentController.AgentRegister);
router.post('/register_Sub_agent', validate,SubAgentController.SubAgentRegister);
router.post('/register_affiliate', validate,AffiliateAuthControllers.register);
router.post('/createUser', register);
// router.get('/sessions/active', adminAuthMiddleware, AdminController.GetActiveAdminSessions);

// router.post('/force-logout/admin/:userId', adminAuthMiddleware,   AdminController.ForceLogoutAdmin);



module.exports = router;

