

// routes/transactionRoutes.js
const express = require('express');
const { body,query } = require('express-validator');
const UserControllers = require('../Controllers/UserController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// Search transactions
router.get('/get_userList', validate, auth, UserControllers.GetRefferralUserList);
// router.get('/search_Widthrawal_transactions', validate, auth, SubAdminControllers.getPendingWidthrawalTransactions);
// router.get('/search_deposit_getways', validate, auth, SubAdminControllers.subAdminGetWayList);
// router.get('/search_widthrawal_getways', validate, auth, SubAdminControllers.WidthrawalGetWayList);
// Update deposit status
// router.put('/update-deposit/:transactionId/status/:status', [
//   query('userId')
//     .notEmpty()
//     .withMessage('User ID is required'),
//   query('status')
//     .isInt({ min: 0, max: 2 })
//     .withMessage('Status must be 0, 1, or 2')
// ], validate, auth, SubAdminControllers.updateDepositStatus);

// // Get deposit totals
// router.get('/deposit-totals', [
//   query('referralCode')
//     .notEmpty()
//     .withMessage('Referral code is required')
// ], validate, auth, SubAdminControllers.getDepositTotals);

// Get total deposit


module.exports = router;