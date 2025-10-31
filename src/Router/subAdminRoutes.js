
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// Search transactions
router.get('/get_sub_admin_affiliateList', validate, auth, SubAdminControllers.getAffiliateList);
router.get('/get_admin_AgentList', validate, auth, SubAdminControllers.GetAgentList);
router.get('/get_admin_UserList', validate, auth, SubAdminControllers.getUserList);
router.get('/get_user_list_by_role', validate, auth, SubAdminControllers.getTransactionList);



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