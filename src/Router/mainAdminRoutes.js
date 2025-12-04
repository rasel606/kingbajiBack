
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const auth = require('../MiddleWare/AdminAuth');
const validate = require('../MiddleWare/validation');
const ModelBettingController = require('../Controllers/ModelBettingController');
const GameListControllers = require('../Controllers/GameListControllers');
const GameMovementController = require('../Controllers/GameMovementController');
const getPlayerUserGameData = require('../Services/getPlayerUserGameData');
const ProviderController = require('../Controllers/providerController');
const Refresh_blance = require('../Controllers/Refresh_blance');
const UserControllers = require('../Controllers/UserController');
const MainTransactinController = require('../Controllers/MainTransactinController');
const router = express.Router();

// Search transactions

router.get('/New-table-categories-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);

router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/get_admin_affiliateList', validate, auth, AdminController.AffiliateModeladmin);
router.get('/affiliate_get_commissionSettings', validate, auth, AdminController.affiliate_get_commissionSettings);
// router.get('/get_rebate_settings', validate, auth, AdminController.getRebateSettings);
router.get('/get_bonus_list', validate, auth, AdminController.getBonuses);
// router.get('/get_users_by_referral', validate, auth, AdminController.getUsersByReferral);
router.get('/get_users_by_Id/:userId', validate, auth, AdminController.getUserById_detaills);
router.get('/get_categories_with_providers_and_games', validate, auth, AdminController.getCategoriesWithProvidersAndGames);
router.get('/dashboard/overview',validate, auth, AdminController.getAdminDashboardStats);
router.get('/dashboard/social_link',validate, auth, AdminController.getSocialLinks);
router.post('/dashboard/update_social_link',validate, auth, AdminController.updateAndCreateSocialLinks);

//////////////////////Sub Admin Routes////////////////////////

router.get('/get_sub_adminList', validate, auth, AdminController.getSubAdminList);
router.get('/get_sub_admin_user_list', validate, auth, AdminController.GetSubAdminUserList);
router.get('/get_sub_admin_pending_deposit_user_list', validate, auth, AdminController.getSubAdminUserDepositList);
router.get('/get_sub_admin_withdraw_deposit_user_list', validate, auth, AdminController.getSubAdminUserWithdrawList);
//////////////////////Admin Agent Routes////////////////////////

router.get('/get_admin_agent_list', validate, auth, AdminController.getAdminAgentList);
router.get('/get_admin_agent_user_list', validate, auth, AdminController.getAdminAgentUserList);
router.get('/get_admin_agent_user_pending_deposit_user_list', validate, auth, AdminController.getAdminAgentUserDepositList);
router.get('/get_admin_agent_user_withdraw__user_list', validate, auth, AdminController.getAdminAgentUserWithdrawList);

router.get('/get_sub_admin_affiliateList', validate, auth, AdminController.getAffiliateList);
// router.get('/get_admin_AgentList', validate, auth, AdminController.GetAgentList);
router.get('/get_admin_UserList', validate, auth, AdminController.getUserList);
router.get('/get_user_list_by_role', validate, auth, AdminController.getTransactionList);
router.get('/get_userList', validate, auth, UserControllers.GetRefferralUserList);
// router.get('/dashboard_stats', auth, AdminController.getDashboardData);
router.post(
  '/get_users_verify-email/:userId',
  auth,
  validate,
  AdminController.verifyEmail
);

// Verify user phone
router.post(
  '/get_users_verify-phone/:userId',
  auth,
  validate,
  AdminController.verifyPhone
);
router.put(
  '/get_users_by_Id_update/:userId',
  auth,
  // validate,[
  //   body('email'),
  //   body('phone'),
  //   body('name'),
  //   body('country'),
  // ],
  AdminController.updateUserProfileById
);
router.put(
  '/get_users_by_Id_Password_update/:userId',
  auth,
  AdminController.changeUserPassword
);
// router.put(
//   '/get_users_transfar_by_Id/:userId',
//   auth,
//   AdminController.Transfar_Deposit_And_Widthraw
// );



router.post(
  '/update-deposit-Widthrowal',
  auth,
  AdminController.processTransactionForALL
);





router.post(
  '/create_bonus',
  auth,
  validate,
  [
    body('name').notEmpty().withMessage('Bonus name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('bonusType').notEmpty().withMessage('Bonus type is required'),
    body('img').notEmpty().withMessage('Image URL is required'),
    body('percentage').optional().isNumeric(),
    body('fixedAmount').optional().isNumeric(),
    body('minDeposit').optional().isNumeric(),
    body('maxBonus').optional().isNumeric(),
    body('minTurnover').optional().isNumeric(),
    body('maxTurnover').optional().isNumeric(),
    body('wageringRequirement').optional().isNumeric(),
    body('validDays').optional().isNumeric(),
    body('eligibleGames').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  AdminController.createBonus
);

// Update an existing bonus
router.put(
  '/update_bonus/:bonusId',
  auth,
  validate,
  [
    body('name').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('bonusType').optional().notEmpty(),
    body('img').optional().notEmpty(),
    body('percentage').optional().isNumeric(),
    body('fixedAmount').optional().isNumeric(),
    body('minDeposit').optional().isNumeric(),
    body('maxBonus').optional().isNumeric(),
    body('minTurnover').optional().isNumeric(),
    body('maxTurnover').optional().isNumeric(),
    body('wageringRequirement').optional().isNumeric(),
    body('validDays').optional().isNumeric(),
    body('eligibleGames').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  AdminController.updateBonus
);

// Delete a bonus
router.delete('/delete_bonus/:bonusId', auth, AdminController.deleteBonus);


module.exports = router;