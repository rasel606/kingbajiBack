// controllers/withdrawalController.js
const Withdrawal = require('../models/AffiliateWithdrawal');
const Affiliate = require('../models/AffiliateModel');
const Transaction = require('../models/TransactionModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginateQuery } = require('../utils/paginationHelper');
const { sendPaginatedResponse } = require('../utils/responseHelper');

// Get withdrawal history
exports.getWithdrawalHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { type, page = 1, limit = 10 } = req.query;
  
  const query = { userId };
  if (type) query.type = type;
  
  const result = await paginateQuery(Withdrawal, query, {
    page,
    limit,
    sort: { createdAt: -1 }
  });
  
  sendPaginatedResponse(res, result.data, result.pagination, 'Withdrawal history retrieved successfully');
});

// Request withdrawal
exports.requestWithdrawal = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { amount, currency, type, bankAccountId, playerInfo } = req.body;
  
  // Check available balance
  const affiliate = await Affiliate.findOne({ userId });
  
  if (amount > affiliate.availableCommission) {
    return next(new AppError('Insufficient available balance', 400));
  }
  
  // Create withdrawal request
  const withdrawal = await Withdrawal.create({
    withdrawalId: `WD${Date.now()}`,
    userId,
    amount,
    currency,
    type,
    bankAccount: type === 'bank' ? bankAccountId : null,
    playerInfo: type === 'player' ? playerInfo : null,
    status: 'pending'
  });
  
  // Update available commission
  affiliate.availableCommission -= amount;
  affiliate.pendingCommission += amount;
  await affiliate.save();
  
  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted successfully',
    data: withdrawal
  });
});

// Get withdrawal by ID
exports.getWithdrawalById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  
  const withdrawal = await Withdrawal.findOne({
    _id: id,
    userId
  });
  
  if (!withdrawal) {
    return next(new AppError('Withdrawal not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: withdrawal
  });
});