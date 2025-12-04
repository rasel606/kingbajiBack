// controllers/transactionController.js
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const transactionService = require('../Services/TransactionService');

exports.submitTransaction = catchAsync(async (req, res, next) => {
  const newTransaction = await transactionService.submitTransaction(req.body);
  res.status(200).json({ success: true, message: 'Transaction submitted successfully', transaction: newTransaction });
});

exports.approveDeposit = catchAsync(async (req, res, next) => {
  const { userId, transactionID, status } = req.query;
  const user = req.user;
  const referralCode = user.referralCode;

  const result = await transactionService.approveDeposit({ userId, referralCode, transactionID, status });
  res.status(200).json({ success: true, ...result });
});
