// controllers/AffiliateManagementController.js
const Affiliate = require('../models/AffiliateModel');
const User = require('../models/User');
const DepositHistory = require('../models/DepositHistoryModel');
const AffiliateWithdrawal = require('../models/AffiliateWithdrawal');
const AffiliateUserWithdrawal = require('../models/AffiliateUserWithdrawal');
const Bank = require('../models/BankTable');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// =============================================
// AFFILIATE USERS MANAGEMENT
// =============================================

exports.getAllAffiliateUsers = catchAsync(async (req, res, next) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = { role: 'affiliate', isDeleted: false };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await Affiliate.find(query)
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Affiliate.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

exports.getAffiliateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await Affiliate.findById(id)
    .populate('referredBy', 'firstName lastName email')
    .select('-password');

  if (!user) {
    return next(new AppError('Affiliate user not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

exports.updateAffiliateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'suspended', 'blocked'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const user = await Affiliate.findByIdAndUpdate(
    id,
    { status, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Affiliate user not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Affiliate user status updated successfully',
    data: user
  });
});

exports.deleteAffiliateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await Affiliate.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!user) {
    return next(new AppError('Affiliate user not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Affiliate user deleted successfully'
  });
});

// =============================================
// AFFILIATE DEPOSITS MANAGEMENT
// =============================================

exports.getAllAffiliateDeposits = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = { affiliateId: { $exists: true } };

  if (status) {
    query.status = status;
  }

  const deposits = await DepositHistory.find(query)
    .populate('userId', 'firstName lastName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await DepositHistory.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: deposits,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

exports.getAffiliateDepositDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deposit = await DepositHistory.findById(id)
    .populate('userId', 'firstName lastName email')
    .populate('affiliateId', 'firstName lastName email');

  if (!deposit) {
    return next(new AppError('Deposit not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: deposit
  });
});

exports.approveAffiliateDeposit = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const deposit = await DepositHistory.findByIdAndUpdate(
    id,
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id,
      remarks
    },
    { new: true, runValidators: true }
  );

  if (!deposit) {
    return next(new AppError('Deposit not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Deposit approved successfully',
    data: deposit
  });
});

exports.rejectAffiliateDeposit = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const deposit = await DepositHistory.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      rejectionReason: reason
    },
    { new: true, runValidators: true }
  );

  if (!deposit) {
    return next(new AppError('Deposit not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Deposit rejected successfully',
    data: deposit
  });
});

// =============================================
// AFFILIATE WITHDRAWALS MANAGEMENT
// =============================================

exports.getAllAffiliateWithdrawals = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) {
    query.status = status;
  }

  const withdrawals = await AffiliateWithdrawal.find(query)
    .populate('affiliateId', 'firstName lastName email')
    .populate('bankAccount')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await AffiliateWithdrawal.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: withdrawals,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

exports.getAffiliateWithdrawalDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const withdrawal = await AffiliateWithdrawal.findById(id)
    .populate('affiliateId', 'firstName lastName email phoneNumber')
    .populate('bankAccount');

  if (!withdrawal) {
    return next(new AppError('Withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: withdrawal
  });
});

exports.approveAffiliateWithdrawal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  const withdrawal = await AffiliateWithdrawal.findByIdAndUpdate(
    id,
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id,
      transactionId
    },
    { new: true, runValidators: true }
  ).populate('affiliateId', 'firstName lastName email phoneNumber');

  if (!withdrawal) {
    return next(new AppError('Withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Withdrawal approved successfully',
    data: withdrawal
  });
});

exports.rejectAffiliateWithdrawal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const withdrawal = await AffiliateWithdrawal.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      rejectionReason: reason
    },
    { new: true, runValidators: true }
  ).populate('affiliateId', 'firstName lastName email phoneNumber');

  if (!withdrawal) {
    return next(new AppError('Withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Withdrawal rejected successfully',
    data: withdrawal
  });
});

// =============================================
// AFFILIATE USER WITHDRAWALS MANAGEMENT
// =============================================

exports.getAllAffiliateUserWithdrawals = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) {
    query.status = status;
  }

  const withdrawals = await AffiliateUserWithdrawal.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('affiliateId', 'firstName lastName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await AffiliateUserWithdrawal.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: withdrawals,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

exports.getAffiliateUserWithdrawalDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const withdrawal = await AffiliateUserWithdrawal.findById(id)
    .populate('userId', 'firstName lastName email phoneNumber')
    .populate('affiliateId', 'firstName lastName email phoneNumber');

  if (!withdrawal) {
    return next(new AppError('User withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: withdrawal
  });
});

exports.approveAffiliateUserWithdrawal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  const withdrawal = await AffiliateUserWithdrawal.findByIdAndUpdate(
    id,
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id,
      transactionId
    },
    { new: true, runValidators: true }
  ).populate('userId', 'firstName lastName email');

  if (!withdrawal) {
    return next(new AppError('User withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User withdrawal approved successfully',
    data: withdrawal
  });
});

exports.rejectAffiliateUserWithdrawal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  const withdrawal = await AffiliateUserWithdrawal.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      rejectionReason: reason
    },
    { new: true, runValidators: true }
  ).populate('userId', 'firstName lastName email');

  if (!withdrawal) {
    return next(new AppError('User withdrawal not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User withdrawal rejected successfully',
    data: withdrawal
  });
});
