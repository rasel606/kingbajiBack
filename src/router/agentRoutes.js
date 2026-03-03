
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const SubAgentController = require('../Controllers/SubAgentController');
const auth = require('../MiddleWare/AgentAuth');
const {register, loginUser} = require('../Controllers/AuthController');
const UserControllers = require('../Controllers/UserController');

const validate = require('../MiddleWare/validation');

const router = express.Router();

// Search transactions
router.post('/auth/register_agent', validate,  AgentController.AgentRegister);

router.post('/auth/agent_login', validate,  AgentController.Login);
router.get('/auth/agent_profile', validate, auth, AgentController.GetProfile);
router.get('/agent_active_session', validate, auth, AgentController.GetActiveSessions);
router.get('/agent_force_logout', validate, auth, AgentController.ForceLogout);
router.get('/agent_exists', validate, auth, AgentController.CheckExists);
router.post('/agent_request_password_reset', validate, auth, AgentController.RequestPasswordResetUser);
router.post('/agent_reset_password', validate, auth, AgentController.ResetPasswordUser);
router.post('/auth/createUser', register);
router.post('/auth/register_sub_agent', validate,  SubAgentController.SubAgentRegister);
router.get('/get_userList', validate, auth, AgentController.GetAllUserList);
router.get('/get_agent_List', validate, auth, AgentController.GetAgentList);
router.get('/get_users_by_Id/:userId', validate, auth, AgentController.GetUserById_detaills);
router.get('/get_agent_users_by_Id/:userId', validate, auth, AgentController.GetAgentUserById_detaills);
router.put('/get_users_by_Id_update/:userId', validate, auth, AgentController.updateUserProfileById);
router.post('/get_users_verify-phone/:userId', validate, auth, AgentController.verifyUserPhone);
router.post('/get_users_verify-email/:userId', validate, auth, AgentController.verifyUserEmail);
router.get('/search_deposit_transactions', validate, auth, AgentController.getPendingAgentDepositTransactions);
router.get('/search_Widthrawal_transactions', validate, auth, AgentController.getPendingAgentWidthralTransactions);
router.get('/deposit_getWay_list', validate, auth, AgentController.DepositGetWayList);
router.get('/widthrow_getWay_list', validate, auth, AgentController.WidthralGetWayList);
router.get('/sub_agent_deposit_transactions_user', validate, auth, AgentController.getListSubAgentUsers);
router.get('/Sub_agent_deposit_transactions', validate, auth, AgentController.getPendingSubAgentDepositTransactions);
router.get('/Sub_agent_widthrow_transactions', validate, auth, AgentController.getPendingSubAgentWidthrowTransactions);
router.get('/agent_transactions_report', validate, auth, AgentController.getAllTransactions);

// router.get('/get_UserList', validate, auth, AgentController.GetUserList);
// router.get('/get_user_list_by_role', validate, auth, AgentController.getTransactionList);




module.exports = router;