// controllers/transactionController.js
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const transactionService = require('../services/TransactionService');
const UserModel = require('../models/User');

exports.submitTransaction = catchAsync(async (req, res, next) => {
  const newTransaction = await transactionService.submitTransaction(req.body);
  res.status(200).json({ success: true, message: 'Transaction submitted successfully', transaction: newTransaction });
});
exports.submitWithdraw = catchAsync(async (req, res, next) => {
  const newTransaction = await transactionService.WithdrawTransaction(req.body);
  res.status(200).json({ success: true, message: 'Transaction submitted successfully', transaction: newTransaction });
});

exports.approveDeposit = catchAsync(async (req, res, next) => {
    console.log("req",req);
    console.log("req.query",req.query);
  const { userId, transactionID, status } = req.query;
  const user = req.user;
  const referralCode = user.referralCode;

  const result = await transactionService.approveDeposit({ userId, referralCode, transactionID, status });
  res.status(200).json({ success: true, ...result });
});

exports.approveWithdraw = catchAsync(async (req, res, next) => {
    console.log("req",req);
    console.log("req.query",req.query);
  const { userId, transactionID, status } = req.query;
  const user = req.user;
  const referralCode = user.referralCode;

  const result = await transactionService.approveWithdraw({ userId, referralCode, transactionID, status });
  res.status(200).json({ success: true, ...result });
});



