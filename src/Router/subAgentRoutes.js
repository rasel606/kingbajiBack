
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');

const SubAgentController = require('../Controllers/SubAgentController');
const auth = require('../MiddleWare/SubAgentAuth');
const {register, loginUser} = require('../Controllers/AuthController');


const validate = require('../MiddleWare/validation');

const router = express.Router();

// Search transactions
router.post('/auth/register_agent', validate, SubAgentController.SubAgentRegister);

router.post('/auth/agent_login', validate,  SubAgentController.Login);
router.get('/auth/agent_profile', validate, auth, SubAgentController.GetProfile);
router.get('/agent_active_session', validate, auth, SubAgentController.GetActiveSessions);
router.get('/agent_force_logout', validate, auth, SubAgentController.ForceLogout);
router.get('/agent_exists', validate, auth, SubAgentController.CheckExists);
router.post('/agent_request_password_reset', validate, auth, SubAgentController.RequestPasswordResetUser);
router.post('/agent_reset_password', validate, auth, SubAgentController.ResetPasswordUser);
router.post('/auth/createUser', register);

router.get('/get_userList', validate, auth, SubAgentController.GetAllUserList);
// router.get('/get_agent_List', validate, auth, SubAgentController.GetAgentList);
router.get('/get_users_by_Id/:userId', validate, auth, SubAgentController.GetUserById_detaills);
router.put('/get_users_by_Id_update/:userId', validate, auth, SubAgentController.updateUserProfileById);
router.post('/get_users_verify-phone/:userId', validate, auth, SubAgentController.verifyUserPhone);
router.post('/get_users_verify-email/:userId', validate, auth, SubAgentController.verifyUserEmail);
// router.get('/search_deposit_transactions', validate, auth, SubAgentController.getPendingDepositTransactionsController);
router.get('/deposit_getWay_list', validate, auth, SubAgentController.DepositGetWayList);
router.get('/widthrow_getWay_list', validate, auth, SubAgentController.WidthralGetWayList);
router.get('/search_deposit_transactions', validate, auth, SubAgentController.getPendingAgentDepositTransactions);
router.get('/search_Widthrawal_transactions', validate, auth, SubAgentController.getPendingAgentWidthralTransactions);

// router.get('/get_UserList', validate, auth, AgentController.GetUserList);
// router.get('/get_user_list_by_role', validate, auth, AgentController.getTransactionList);




module.exports = router;