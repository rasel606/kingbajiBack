// // routes/transactionRoutes.js
// const express = require('express');
// const { body } = require('express-validator');
// const SubAdminControllers = require('../Controllers/SubAdminControllers');
// const auth = require('../MiddleWare/subAdminAuth');
// const validate = require('../MiddleWare/validation');

// const router = express.Router();

// // Search deposit transactions
// router.post('/search-deposit-transactions', [
//   body('referredBy')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.searchDepositTransactions);

// // Update deposit status
// router.put('/update-deposit-status/:transactionId', [
//   body('status')
//     .isInt({ min: 0, max: 2 })
//     .withMessage('Status must be 0, 1, or 2'),
//   body('userId')
//     .notEmpty()
//     .withMessage('User ID is required')
// ], validate, auth, SubAdminControllers.updateDepositStatus);

// // Get deposit totals
// router.get('/deposit-totals/:referredBy', auth, SubAdminControllers.getDepositTotals);

// module.exports = router;











// routes/transactionRoutes.js
const express = require('express');
const { body,query } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const newTransactionController = require('../Controllers/newTransactionController');
const paymentMethodController = require('../Controllers/paymentMethodController');
const auth = require('../MiddleWare/AdminAuth');
const validate = require('../MiddleWare/validation');
const MainTransactinController = require('../Controllers/MainTransactinController');
const router = express.Router();

// // Search transactions
router.get('/search_deposit_transactions', validate, auth, AdminController.getPendingDepositTransactions);
router.get('/search_Widthrawal_transactions', validate, auth, AdminController.getPendingWidthrawalTransactions);
router.get('/search_deposit_getways', validate, auth, AdminController.subAdminGetWayList);
router.get('/search_widthrawal_getways', validate, auth, AdminController.WidthrawalGetWayList);
// Update deposit status
router.post('/update-deposit-Widthrowal', validate, auth, newTransactionController.approveDeposit);
router.post('/submit-transaction', validate, newTransactionController.submitTransaction);

// Get deposit totals
router.get('/deposit-totals', [
  query('referralCode')
    .notEmpty()
    .withMessage('Referral code is required')
], validate, auth, AdminController.getDepositTotals);

// Get total deposit


module.exports = router;