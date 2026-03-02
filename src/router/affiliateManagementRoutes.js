// router/affiliateManagementRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  // Affiliate Users
  getAllAffiliateUsers,
  getAffiliateUser,
  updateAffiliateUserStatus,
  deleteAffiliateUser,
  // Affiliate Deposits
  getAllAffiliateDeposits,
  getAffiliateDepositDetails,
  approveAffiliateDeposit,
  rejectAffiliateDeposit,
  // Affiliate Withdrawals
  getAllAffiliateWithdrawals,
  getAffiliateWithdrawalDetails,
  approveAffiliateWithdrawal,
  rejectAffiliateWithdrawal,
  // Affiliate User Withdrawals
  getAllAffiliateUserWithdrawals,
  getAffiliateUserWithdrawalDetails,
  approveAffiliateUserWithdrawal,
  rejectAffiliateUserWithdrawal
} = require('../controllers/AffiliateManagementController');
const { protectAdmin } = require('../MiddleWare/adminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// =============================================
// AFFILIATE USERS ROUTES
// =============================================

router.get('/users', getAllAffiliateUsers);
router.get('/users/:id', getAffiliateUser);
router.put(
  '/users/:id/status',
  [
    body('status')
      .isIn(['active', 'inactive', 'suspended', 'blocked'])
      .withMessage('Invalid status value')
  ],
  validate,
  updateAffiliateUserStatus
);
router.delete('/users/:id', deleteAffiliateUser);

// =============================================
// AFFILIATE DEPOSITS ROUTES
// =============================================

router.get('/deposits', getAllAffiliateDeposits);
router.get('/deposits/:id', getAffiliateDepositDetails);
router.put(
  '/deposits/:id/approve',
  [
    body('remarks').optional().isString().withMessage('Remarks must be a string')
  ],
  validate,
  approveAffiliateDeposit
);
router.put(
  '/deposits/:id/reject',
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
  ],
  validate,
  rejectAffiliateDeposit
);

// =============================================
// AFFILIATE WITHDRAWALS ROUTES
// =============================================

router.get('/withdrawals', getAllAffiliateWithdrawals);
router.get('/withdrawals/:id', getAffiliateWithdrawalDetails);
router.put(
  '/withdrawals/:id/approve',
  [
    body('transactionId').optional().isString().withMessage('Transaction ID must be a string')
  ],
  validate,
  approveAffiliateWithdrawal
);
router.put(
  '/withdrawals/:id/reject',
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
  ],
  validate,
  rejectAffiliateWithdrawal
);

// =============================================
// AFFILIATE USER WITHDRAWALS ROUTES
// =============================================

router.get('/user-withdrawals', getAllAffiliateUserWithdrawals);
router.get('/user-withdrawals/:id', getAffiliateUserWithdrawalDetails);
router.put(
  '/user-withdrawals/:id/approve',
  [
    body('transactionId').optional().isString().withMessage('Transaction ID must be a string')
  ],
  validate,
  approveAffiliateUserWithdrawal
);
router.put(
  '/user-withdrawals/:id/reject',
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
  ],
  validate,
  rejectAffiliateUserWithdrawal
);

module.exports = router;
