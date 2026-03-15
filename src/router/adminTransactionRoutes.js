const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const apiIntregationsController = require('../Controllers/apiIntregationsController');
const auth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');

// Commission & Balance
router.get('/affiliate_get_commissionSettings', validate, auth, AdminController.affiliate_get_commissionSettings);
router.get('/update-admin-balance', validate, auth, apiIntregationsController.updateAdminBalance);

// User Transactions
router.put('/get_users_transfar_by_Id/:userId', auth, AdminController.Transfar_Deposit_And_Widthraw);
router.post('/update-deposit-Widthrowal', auth, AdminController.processTransactionForALL);

// Bonus Management
router.get('/get_bonus_list', validate, auth, AdminController.getBonuses);

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

router.delete('/delete_bonus/:bonusId', auth, AdminController.deleteBonus);

module.exports = router;