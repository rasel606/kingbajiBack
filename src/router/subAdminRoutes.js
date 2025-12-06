
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const SubAgentController = require('../Controllers/SubAgentController');
const AffiliateController = require('../Controllers/AffiliateController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');
const {register, loginUser} = require('../Controllers/AuthController');
const router = express.Router();

// Search transactions
router.get('/get_sub_admin_affiliateList', validate, auth, SubAdminControllers.GetAffiliateList);

router.get('/get_admin_UserList', validate, auth, SubAdminControllers.GetUserList);
// router.get('/get_user_list_by_role', validate, auth, SubAdminControllers.getTransactionList);

// Search transactions
router.post('/auth/register_agent', validate,  AgentController.AgentRegister);
router.post('/auth/register_affiliate', validate,  AffiliateController.registerAffiliate);

// router.post('/auth/agent_login', validate,  AgentController.Login);
// router.get('/auth/agent_profile', validate, auth, AgentController.GetProfile);
// router.get('/agent_active_session', validate, auth, AgentController.GetActiveSessions);
// router.get('/agent_force_logout', validate, auth, AgentController.ForceLogout);
// router.get('/agent_exists', validate, auth, AgentController.CheckExists);
// router.post('/agent_request_password_reset', validate, auth, AgentController.RequestPasswordResetUser);
// router.post('/agent_reset_password', validate, auth, AgentController.ResetPasswordUser);
router.post('/auth/createUser', register);
router.post('/auth/register_sub_agent', validate,  SubAgentController.SubAgentRegister);

////////////////////////Agent////////////////////////////

router.get('/get_userList', validate, auth, SubAdminControllers.GetUserList);
router.get('/get_agent_List', validate, auth, SubAdminControllers.GetAgentList);
router.get('/get_agent_pending_deposit_list', validate, auth, SubAdminControllers.getPendingAgentDepositTransactions);
router.get('/get_agent_pending_widthrow_list', validate, auth, SubAdminControllers.getPendingAgentWidthralTransactions);
///////////////////////Sub Agent////////////////////////////
router.get('/get_sub_agent_List', validate, auth, SubAdminControllers.getSubListAgent);
router.get('/get_sub_agent_usert_List', validate, auth, SubAdminControllers.getListSubAgentUsers);
router.get('/get_sub_agent_pending_deposit_List', validate, auth, SubAdminControllers.getPendingSubAgentDepositTransactions);
router.get('/get_sub_agent_pending_widthrow_List', validate, auth, SubAdminControllers.getPendingSubAgentWidthralTransactions);


///////////////////////////Affiliate//////////////////////////////////
router.get('/get_affiliate_user_List', validate, auth, SubAdminControllers.getListAffiliateUsers);
router.get('/get_affiliate__List', validate, auth, SubAdminControllers.GetAffiliateList);
router.get('/get_affiliate_pending_deposit_List', validate, auth, SubAdminControllers.getPendingAffiliateDepositTransactions);
router.get('/get_affiliate_pending_widthrow_List', validate, auth, SubAdminControllers.getPendingAffiliateWidthralTransactions);







router.get('/get_users_by_Id/:userId', validate, auth, AgentController.GetUserById_detaills);
router.get('/get_agent_users_by_Id/:userId', validate, auth, AgentController.GetAgentUserById_detaills);
router.put('/get_users_by_Id_update/:userId', validate, auth, AgentController.updateUserProfileById);
router.post('/get_users_verify-phone/:userId', validate, auth, AgentController.verifyUserPhone);
router.post('/get_users_verify-email/:userId', validate, auth, AgentController.verifyUserEmail);






// router.get('/search_deposit_transactions', validate, auth, AgentController.getPendingAgentDepositTransactions);
// router.get('/search_Widthrawal_transactions', validate, auth, AgentController.getPendingAgentWidthralTransactions);
router.get('/deposit_getWay_list', validate, auth, AgentController.DepositGetWayList);
router.get('/widthrow_getWay_list', validate, auth, AgentController.WidthralGetWayList);


router.get('/sub_agent_deposit_transactions_user', validate, auth, AgentController.getListSubAgentUsers);
router.get('/deposit_transactions', validate, auth, SubAdminControllers.getPendingDepositTransactions);
router.get('/widthrow_transactions', validate, auth, SubAdminControllers.getPendingWidthralTransactions);
router.get('/agent_transactions_report', validate, auth, AgentController.getAllTransactions);

router.get('/deposit_getWay_list', validate, auth, SubAdminControllers.DepositGetWayList);
router.get('/widthrow_getWay_list', validate, auth,  SubAdminControllers.WidthralGetWayList);
router.get('/search_report_deposit_transactions', validate, auth, SubAdminControllers.getPendingAgentDepositTransactions);
router.get('/search_report_Widthrawal_transactions', validate, auth, SubAdminControllers.getPendingAgentWidthralTransactions);
router.get('/affiliate_users_deposit_transactions', validate, auth, SubAdminControllers.getPendingAffiliateDepositTransactions);
router.get('/affiliate_users_Widthrawal_transactions', validate, auth, SubAdminControllers.getPendingAffiliateWidthralTransactions);

// router.post(
//   '/get_users_verify-email/:userId',
//   auth,
//   validate,
//   SubAdminControllers.verifyEmail
// );

// // Verify user phone
// router.post(
//   '/get_users_verify-phone/:userId',
//   auth,
//   validate,
//   SubAdminControllers.verifyPhone
// );
// router.put(
//   '/get_users_by_Id_update/:userId',
//   auth,
//   // validate,[
//   //   body('email'),
//   //   body('phone'),
//   //   body('name'),
//   //   body('country'),
//   // ],
//   SubAdminControllers.updateUserProfileById
// );
// router.put(
//   '/get_users_by_Id_Password_update/:userId',
//   auth,
//   SubAdminControllers.changeUserPassword
// );
// // router.put(
// //   '/get_users_transfar_by_Id/:userId',
// //   auth,
// //   AdminController.Transfar_Deposit_And_Widthraw
// // );



// router.post(
//   '/update-deposit-Widthrowal',
//   auth,
//   SubAdminControllers.processTransactionForALL
// );





module.exports = router;