
// routes/transactionRoutes.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const ModelBettingController = require('../Controllers/ModelBettingController');
const GameListControllers = require('../Controllers/GameListControllers');
const GameMovementController = require('../Controllers/GameMovementController');
const getPlayerUserGameData = require('../Services/getPlayerUserGameData');
const ProviderController = require('../Controllers/providerController');
const Refresh_blance = require('../Controllers/Refresh_blance');
const auth = require('../MiddleWare/AdminAuth');
const validate = require('../MiddleWare/validation');
const CreateUserService = require("../Services/CreateUserService");
const {register, loginUser} = require('../Controllers/AuthController');
const UpdateProfile = require('../Controllers/UpdateProfile');
const router = express.Router();

// Search transactions
router.get('/get_sub_adminList', validate, auth, SubAdminControllers.GetSubAdminList);
router.get('/get_sub_admin_affiliateList', validate, auth, SubAdminControllers.GetSubAdminAffiliateList);
router.get('/get_admin_affiliateList', validate, auth, AdminController.AffiliateModeladmin);
router.get('/get_admin_AgentList', validate, auth, AgentController.GetAgentAdmin);
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



router.get('/dashboard_stats', auth, SubAdminControllers.getDashboardData);




router.get('/get-games', getPlayerUserGameData.getAllGames);
router.get('/New-table-Games-with-Category-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);

router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/categories', getPlayerUserGameData.getAllCategories);






router.post('/register_admin', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

], validate,  AdminController.CreateAdmin);

router.post('/login_admin', [
  body('email')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validate,  AdminController.AdminLogin

);

router.get('/main_admin',
  auth,
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }
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