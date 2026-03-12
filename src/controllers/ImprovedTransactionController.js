/**
 * Improved Transaction Controller
 * Demonstrates best practices for handling financial transactions
 * with proper validation, error handling, and logging
 */

const Transaction = require('../models/TransactionModel');
const User = require('../models/User');
const SubAdmin = require('../models/SubAdminModel');
const Bonus = require('../models/Bonus');
const UserBonus = require('../models/UserBonus');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { 
  sendSuccess, 
  sendError, 
  sendPaginatedResponse,
  sendNotFound,
  sendUnauthorized 
} = require('../utils/responseHelper');
const { 
  validateDepositRequest,
  validateWithdrawalRequest,
  validateSearchQuery 
} = require('../utils/enhancedValidators');
const { parseQueryParams, createPaginationMeta } = require('../utils/paginationHelper');
const notificationController = require('../controllers/notificationController');
const logger = require('../utils/logger');

/**
 * Submit deposit request
 * POST /api/transaction/deposit
 */
exports.submitDeposit = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error, value } = validateDepositRequest(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  const { userId, base_amount, referredBy, payment_type, gateway_name, gateway_Number, transactionID, bonusCode } = value;

  // Find user
  const user = await User.findOne({ userId, referredBy });
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Validate amount
  const amount = parseFloat(base_amount);
  if (isNaN(amount) || amount <= 0) {
    return sendError(res, 'Invalid amount', 400);
  }

  // Check duplicate transaction
  const existingTransaction = await Transaction.findOne({ transactionID });
  if (existingTransaction) {
    return sendError(res, 'Transaction ID already exists', 409);
  }

  // Calculate bonus if applicable
  let bonusAmount = 0;
  let bonusId = null;
  let turnoverRequirement = 0;

  if (amount >= 200 && bonusCode) {
    const depositBonus = await Bonus.findOne({
      bonusType: 'deposit',
      isActive: true,
      minDeposit: { $lte: amount },
      _id: bonusCode
    }).sort({ minDeposit: -1 });

    if (depositBonus) {
      bonusAmount = depositBonus.fixedAmount || Math.floor((amount * depositBonus.percentage) / 100);
      
      if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus) {
        bonusAmount = depositBonus.maxBonus;
      }

      bonusId = depositBonus._id;
      turnoverRequirement = (amount + bonusAmount) * depositBonus.wageringRequirement;
    }
  }

  // Create transaction
  const transaction = await Transaction.create({
    userId: user.userId,
    transactionID,
    base_amount: amount,
    bonus_amount: bonusAmount,
    amount: amount + bonusAmount,
    gateway_name,
    gateway_Number,
    payment_type,
    mobile: user.phone?.[0]?.number || '',
    type: 0, // deposit
    status: 0, // pending
    referredBy: user.referredBy,
    bonusId,
    isBonusApplied: bonusAmount > 0,
    bonusStatus: bonusAmount > 0 ? 'pending' : undefined,
    turnoverRequirement,
    expiryDate: bonusAmount > 0 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      : null
  });

  // Send user notification
  await notificationController.createNotification(
    'Deposit Request Submitted',
    user.userId,
    `Your deposit request of ${transaction.amount} has been submitted successfully.`,
    'deposit_request',
    { amount: transaction.amount, transactionID }
  );

  // Send notification to admin
  await notificationController.notifyAllAdmins(
    'New Deposit Request',
    `User ${user.name} (${user.userId}) submitted a deposit of ${transaction.amount}`,
    'admin_deposit_request',
    { amount: transaction.amount, transactionID, userId: user.userId }
  );

  logger.info('Deposit request submitted', {
    transactionID,
    userId: user.userId,
    amount: transaction.amount,
    bonusAmount
  });

  return sendSuccess(res, {
    transaction: {
      transactionID: transaction.transactionID,
      amount: transaction.amount,
      bonusAmount,
      status: transaction.status
    }
  }, 'Deposit request submitted successfully', 201);
});

/**
 * Submit withdrawal request
 * POST /api/transaction/withdraw
 */
exports.submitWithdrawal = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error, value } = validateWithdrawalRequest(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  const { userId, amount, gateway_name, mobile, referredBy } = value;

  // Find user
  const user = await User.findOne({ userId, referredBy });
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Validate amount
  const withdrawalAmount = parseFloat(amount);
  if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
    return sendError(res, 'Invalid amount', 400);
  }

  // Check minimum withdrawal
  if (withdrawalAmount < 100) {
    return sendError(res, 'Minimum withdrawal amount is 100', 400);
  }

  // Check balance
  if (user.balance < withdrawalAmount) {
    return sendError(res, 'Insufficient balance', 400);
  }

  // Check for active bonuses with turnover requirements
  const activeBonuses = await UserBonus.find({
    userId: user.userId,
    status: { $in: ['active', 'pending'] },
    expiryDate: { $gt: new Date() }
  });

  if (activeBonuses.length > 0) {
    // Check if turnover requirements are met
    for (const bonus of activeBonuses) {
      if (bonus.remainingAmount > 0) {
        return sendError(
          res, 
          `You have active bonuses with incomplete turnover requirements. Please complete ${bonus.turnoverRequirement - bonus.completedTurnover} more in turnover.`, 
          400
        );
      }
    }
  }

  // Generate transaction ID
  const transactionID = `WDR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create transaction
  const transaction = await Transaction.create({
    userId: user.userId,
    transactionID,
    base_amount: withdrawalAmount,
    amount: withdrawalAmount,
    gateway_name,
    mobile,
    type: 1, // withdrawal
    status: 0, // pending
    referredBy: referredBy || null
  });

  // Deduct balance (hold for approval)
  user.balance -= withdrawalAmount;
  await user.save();

  // Send notification to user
  await notificationController.createNotification(
    'Withdrawal Request Submitted',
    user.userId,
    `Your withdrawal request of ${withdrawalAmount} has been submitted.`,
    'withdrawal_request',
    { amount: withdrawalAmount, transactionID }
  );

  logger.info('Withdrawal request submitted', {
    transactionID,
    userId: user.userId,
    amount: withdrawalAmount
  });

  return sendSuccess(res, {
    transaction: {
      transactionID: transaction.transactionID,
      amount: transaction.amount,
      status: transaction.status,
      remainingBalance: user.balance
    }
  }, 'Withdrawal request submitted successfully', 201);
});

/**
 * Approve or reject transaction
 * PUT /api/transaction/:transactionID/approve
 */
exports.approveTransaction = catchAsync(async (req, res, next) => {
  const { transactionID } = req.params;
  const { status, notes } = req.body;

  // Validate status
  if (![1, 2].includes(status)) {
    return sendError(res, 'Invalid status. Use 1 for approve or 2 for reject', 400);
  }

  // Find transaction
  const transaction = await Transaction.findOne({ transactionID });
  if (!transaction) {
    return sendNotFound(res, 'Transaction');
  }

  // Check if already processed
  if (transaction.status !== 0) {
    return sendError(res, 'Transaction already processed', 400);
  }

  // Find user
  const user = await User.findOne({ userId: transaction.userId });
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Update transaction
  transaction.status = status;
  transaction.updatetime = new Date();
  transaction.processedBy = req.user?.userId;
  if (notes) transaction.notes = notes;

  if (status === 1) {
    // Approve
    
    // For withdrawals, the balance was already deducted
    // For deposits, add balance now
    if (transaction.type === 0) {
      user.balance += transaction.amount;
    }

    transaction.bonusStatus = 'active';

    // Handle bonus if applied
    if (transaction.isBonusApplied && transaction.bonusId) {
      await UserBonus.create({
        userId: user.userId,
        bonusId: transaction.bonusId,
        amount: transaction.amount,
        bonusAmount: transaction.bonus_amount,
        remainingAmount: transaction.bonus_amount,
        turnoverRequirement: transaction.turnoverRequirement,
        expiryDate: transaction.expiryDate,
        transactionId: transaction.transactionID
      });

      user.bonus = {
        active: true,
        bonusAmount: transaction.bonus_amount,
        wageringRequirement: transaction.turnoverRequirement,
        completedTurnover: 0
      };
    }

    // Send approval notification
    await notificationController.createNotification(
      transaction.type === 0 ? 'Deposit Approved' : 'Withdrawal Approved',
      user.userId,
      `Your ${transaction.type === 0 ? 'deposit' : 'withdrawal'} of ${transaction.amount} has been approved.`,
      transaction.type === 0 ? 'deposit_approved' : 'withdrawal_approved',
      { amount: transaction.amount, transactionID }
    );

    logger.info('Transaction approved', {
      transactionID,
      type: transaction.type === 0 ? 'deposit' : 'withdrawal',
      amount: transaction.amount,
      processedBy: req.user?.userId
    });

  } else {
    // Reject
    
    // For withdrawals, refund the balance
    if (transaction.type === 1) {
      user.balance += transaction.base_amount;
    }

    // Send rejection notification
    await notificationController.createNotification(
      transaction.type === 0 ? 'Deposit Rejected' : 'Withdrawal Rejected',
      user.userId,
      `Your ${transaction.type === 0 ? 'deposit' : 'withdrawal'} request has been rejected.`,
      transaction.type === 0 ? 'deposit_rejected' : 'withdrawal_rejected',
      { amount: transaction.amount, transactionID }
    );

    logger.info('Transaction rejected', {
      transactionID,
      type: transaction.type === 0 ? 'deposit' : 'withdrawal',
      amount: transaction.amount,
      processedBy: req.user?.userId
    });
  }

  await user.save();
  await transaction.save();

  return sendSuccess(res, {
    transaction: {
      transactionID: transaction.transactionID,
      status: transaction.status,
      amount: transaction.amount,
      updatedAt: transaction.updatetime
    }
  }, status === 1 ? 'Transaction approved successfully' : 'Transaction rejected');
});

/**
 * Get all transactions with filters
 * GET /api/transaction
 */
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  // Parse query parameters
  const { pagination, sort, filters } = parseQueryParams(req.query, {
    pagination: true,
    sorting: true,
    filtering: true,
    allowedSortFields: ['createdAt', 'amount', 'base_amount', 'status'],
    allowedFilterFields: ['userId', 'type', 'status', 'gateway_name']
  });

  // Build query
  const query = { ...filters };
  
  // Role-based filtering
  if (req.user && req.user.role !== 'Admin') {
    query.referredBy = req.user.referralCode;
  }

  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Transaction.countDocuments(query)
  ]);

  const paginationMeta = createPaginationMeta(pagination.page, pagination.limit, total);

  return sendPaginatedResponse(res, transactions, paginationMeta, 'Transactions fetched successfully');
});

/**
 * Get transaction by ID
 * GET /api/transaction/:transactionID
 */
exports.getTransactionById = catchAsync(async (req, res, next) => {
  const { transactionID } = req.params;

  const transaction = await Transaction.findOne({ transactionID })
    .populate('userId', 'userId name email')
    .populate('bonusId', 'name bonusType percentage');

  if (!transaction) {
    return sendNotFound(res, 'Transaction');
  }

  return sendSuccess(res, transaction, 'Transaction fetched successfully');
});

/**
 * Get user's transaction history
 * GET /api/transaction/user/:userId
 */
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { type, status, startDate, endDate, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userId };

  if (type !== undefined) query.type = parseInt(type);
  if (status !== undefined) query.status = parseInt(status);

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Transaction.countDocuments(query)
  ]);

  const pagination = createPaginationMeta(pageNum, limitNum, total);

  return sendPaginatedResponse(res, transactions, pagination, 'User transactions fetched successfully');
});

/**
 * Get transaction statistics
 * GET /api/transaction/stats
 */
exports.getTransactionStats = catchAsync(async (req, res, next) => {
  const { period = 'today', referredBy } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
  }

  // Build match query
  const matchQuery = {
    createdAt: { $gte: startDate },
    status: 1 // Only completed transactions
  };

  if (referredBy) {
    matchQuery.referredBy = referredBy;
  }

  // Aggregate stats
  const stats = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { type: '$type', status: '$status' },
        totalAmount: { $sum: '$amount' },
        baseAmount: { $sum: '$base_amount' },
        bonusAmount: { $sum: '$bonus_amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        deposits: {
          $sum: {
            $cond: [{ $eq: ['$_id', 0] }, '$count', 0]
          }
        },
        withdrawals: {
          $sum: {
            $cond: [{ $eq: ['$_id', 1] }, '$count', 0]
          }
        },
        totalDeposits: {
          $sum: {
            $cond: [{ $eq: ['$_id', 0] }, '$totalAmount', 0]
          }
        },
        totalWithdrawals: {
          $sum: {
            $cond: [{ $eq: ['$_id', 1] }, '$totalAmount', 0]
          }
        }
      }
    }
  ]);

  // Format response
  const result = stats[0] || {
    deposits: 0,
    withdrawals: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  };

  return sendSuccess(res, {
    period,
    ...result,
    netRevenue: result.totalDeposits - result.totalWithdrawals
  }, 'Transaction stats fetched successfully');
});

/**
 * Search transactions
 * POST /api/transaction/search
 */
exports.searchTransactions = catchAsync(async (req, res, next) => {
  // Validate search query
  const { error, value } = validateSearchQuery(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Build filters
  const filters = {};
  
  if (value.userId) filters.userId = { $regex: value.userId, $options: 'i' };
  if (value.gateway_name) filters.gateway_name = value.gateway_name;
  if (value.type !== undefined) filters.type = parseInt(value.type);
  if (value.status !== undefined) filters.status = parseInt(value.status);

  // Date range
  if (value.startDate || value.endDate) {
    filters.createdAt = {};
    if (value.startDate) filters.createdAt.$gte = new Date(value.startDate);
    if (value.endDate) filters.createdAt.$lte = new Date(value.endDate);
  }

  // Amount range
  if (value.minAmount || value.maxAmount) {
    filters.base_amount = {};
    if (value.minAmount) filters.base_amount.$gte = parseFloat(value.minAmount);
    if (value.maxAmount) filters.base_amount.$lte = parseFloat(value.maxAmount);
  }

  // Pagination
  const page = parseInt(value.page) || 1;
  const limit = parseInt(value.limit) || 10;
  const skip = (page - 1) * limit;

  // Execute search
  const [transactions, total] = await Promise.all([
    Transaction.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filters)
  ]);

  const pagination = createPaginationMeta(page, limit, total);

  logger.info('Transaction search performed', {
    filters: Object.keys(filters),
    results: total,
    searchedBy: req.user?.userId
  });

  return sendPaginatedResponse(res, transactions, pagination, 'Search results fetched successfully');
});

/**
 * Get pending transactions count
 * GET /api/transaction/pending/count
 */
exports.getPendingCount = catchAsync(async (req, res, next) => {
  const { type } = req.query;

  const query = { status: 0 };
  if (type !== undefined) {
    query.type = parseInt(type);
  }

  const count = await Transaction.countDocuments(query);

  return sendSuccess(res, { pendingCount: count }, 'Pending count fetched successfully');
});

/**
 * Bulk approve transactions
 * POST /api/transaction/bulk/approve
 */
exports.bulkApproveTransactions = catchAsync(async (req, res, next) => {
  const { transactionIDs, status, notes } = req.body;

  if (!transactionIDs || !Array.isArray(transactionIDs)) {
    return sendError(res, 'Transaction IDs array is required', 400);
  }

  if (![1, 2].includes(status)) {
    return sendError(res, 'Invalid status', 400);
  }

  // Find pending transactions
  const transactions = await Transaction.find({
    transactionID: { $in: transactionIDs },
    status: 0
  });

  if (transactions.length === 0) {
    return sendError(res, 'No pending transactions found', 404);
  }

  const results = {
    success: [],
    failed: []
  };

  // Process each transaction
  for (const transaction of transactions) {
    try {
      const user = await User.findOne({ userId: transaction.userId });
      
      if (!user) {
        results.failed.push({ 
          transactionID: transaction.transactionID, 
          reason: 'User not found' 
        });
        continue;
      }

      transaction.status = status;
      transaction.updatetime = new Date();
      transaction.processedBy = req.user?.userId;
      if (notes) transaction.notes = notes;

      if (status === 1) {
        // Approve
        if (transaction.type === 0) {
          user.balance += transaction.amount;
        } else {
          // For withdrawals, balance was already deducted
        }
        
        transaction.bonusStatus = 'active';
      } else {
        // Reject
        if (transaction.type === 1) {
          user.balance += transaction.base_amount;
        }
      }

      await user.save();
      await transaction.save();

      results.success.push(transaction.transactionID);
    } catch (err) {
      results.failed.push({ 
        transactionID: transaction.transactionID, 
        reason: err.message 
      });
    }
  }

  logger.info('Bulk transaction processing completed', {
    successCount: results.success.length,
    failedCount: results.failed.length,
    processedBy: req.user?.userId
  });

  return sendSuccess(res, results, 'Bulk processing completed');
});

