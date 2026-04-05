const express = require('express');
const router = express.Router();
const SubAdminControllers = require('../controllers/SubAdminControllers');
const AdminController = require('../controllers/AdminController');
const AgentController = require('../controllers/AgentController');
const CreateUserService = require("../services/CreateUserService");
const { register } = require('../controllers/AuthController');
const UpdateProfile = require('../controllers/UpdateProfile');
const auth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');

// Sub-Admin & Agent Lists
router.get('/get_sub_adminList', validate, auth, SubAdminControllers.GetSubAdminList);
router.get('/get_sub_admin_affiliateList', validate, auth, SubAdminControllers.GetSubAdminAffiliateList);
router.get('/get_admin_affiliateList', validate, auth, AdminController.AffiliateModeladmin);
router.get('/get_admin_AgentList', validate, auth, AgentController.GetAgentAdmin);
router.get('/get_Sub_admin_userList', validate, auth, AgentController.GetSubAdminUserList);

// User Management
router.get('/get_users_by_referral', validate, auth, AdminController.getUsersByReferral);
router.get('/get_users_by_Id/:userId', validate, auth, AdminController.getUserById_detaills);
router.get('/user_details', auth, CreateUserService.userDetails);
router.post('/createUser', register);

// Profile Updates
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);

// User Verification & Edits
router.post('/get_users_verify-email/:userId', auth, validate, AdminController.verifyEmail);
router.post('/get_users_verify-phone/:userId', auth, validate, AdminController.verifyPhone);
router.put('/get_users_by_Id_update/:userId', auth, AdminController.updateUserProfileById);
router.put('/get_users_by_Id_Password_update/:userId', auth, AdminController.changeUserPassword);

module.exports = router;