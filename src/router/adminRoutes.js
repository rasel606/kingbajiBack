
// routes/transactionRoutes.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SubAdminControllers = require('../controllers/SubAdminControllers');
const AdminController = require('../controllers/AdminController');
const AgentController = require('../controllers/AgentController');
const ModelBettingController = require('../controllers/modelBettingController');
const GameListControllers = require('../controllers/GameListControllers');
const GameMovementController = require('../controllers/GameMovementController');
const getPlayerUserGameData = require('../services/getPlayerUserGameData');
const ProviderController = require('../controllers/providerController');
const Refresh_blance = require('../controllers/Refresh_blance');
const auth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');
const CreateUserService = require("../services/CreateUserService");
const {register, loginUser} = require('../controllers/AuthController');
const apiIntregationsController = require('../controllers/apiIntregationsController');
const UpdateProfile = require('../controllers/UpdateProfile');
const router = express.Router();

// Search transactions
router.get('/get_sub_adminList', validate, auth, SubAdminControllers.GetSubAdminList);
router.get('/get_sub_admin_affiliateList', validate, auth, SubAdminControllers.GetSubAdminAffiliateList);
router.get('/get_admin_affiliateList', validate, auth, AdminController.AffiliateModeladmin);
router.get('/get_admin_AgentList', validate, auth, AgentController.GetAgentAdmin);
router.get('/get_Sub_admin_userList', validate, auth, AgentController.GetSubAdminUserList);
router.get('/affiliate_get_commissionSettings', validate, auth, AdminController.affiliate_get_commissionSettings);
// router.get('/get_rebate_settings', validate, auth, AdminController.getRebateSettings);
router.get('/get_bonus_list', validate, auth, AdminController.getBonuses);
router.get('/get_users_by_referral', validate, auth, AdminController.getUsersByReferral);
router.get('/get_users_by_Id/:userId', validate, auth, AdminController.getUserById_detaills);
router.get('/get_categories_with_providers_and_games', validate, auth, AdminController.getCategoriesWithProvidersAndGames);
router.get('/dashboard/overview',validate, auth, AdminController.getAdminDashboardStats);
router.get('/dashboard/social_link',validate, auth, AdminController.getSocialLinks);
router.post('/dashboard/update_social_link',validate, auth, AdminController.updateAndCreateSocialLinks);
router.get('/user_details', auth, CreateUserService.userDetails);
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);
router.post('/createUser', register);
router.get('/update-admin-balance', validate, auth, apiIntregationsController.updateAdminBalance);


router.get('/dashboard_stats', auth, SubAdminControllers.getDashboardData);




router.get('/get-games', getPlayerUserGameData.getAllGames);
router.get('/New-table-Games-with-Category-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);

router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/categories', getPlayerUserGameData.getAllCategories);






router.post('/register_admin',  validate,  AdminController.CreateAdmin);

router.post('/login_admin',  validate,  AdminController.AdminLogin

);

router.get('/main_admin',
  auth,
  (req, res, next) => {
console.log("req",req.user)
    next();
  },
   AdminController.GetAdminProfile);


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
router.put(
  '/get_users_transfar_by_Id/:userId',
  auth,
  AdminController.Transfar_Deposit_And_Widthraw
);



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