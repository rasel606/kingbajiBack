/**
 * Improved User Controller
 * Demonstrates best practices and patterns for controller implementation
 * Use this as a reference for refactoring other controllers
 */

const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { 
  sendSuccess, 
  sendError, 
  sendPaginatedResponse,
  sendNotFound,
  sendUnauthorized,
  sendValidationError 
} = require('../utils/responseHelper');
const { 
  validateUserRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validatePagination,
  validateSearchQuery,
  sanitizeObject
} = require('../utils/enhancedValidators');
const { parseQueryParams, createPaginationMeta } = require('../utils/paginationHelper');
const logger = require('../utils/logger');

/**
 * Get all users with advanced filtering, pagination, and sorting
 * GET /api/users
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Parse query parameters
  const { pagination, sort, filters } = parseQueryParams(req.query, {
    pagination: true,
    sorting: true,
    filtering: true,
    allowedSortFields: ['createdAt', 'balance', 'name', 'userId'],
    allowedFilterFields: ['userId', 'email', 'isActive', 'isVerified']
  });

  // Build MongoDB query
  const query = { ...filters };
  
  // Add role-based filtering
  if (req.user && req.user.role !== 'Admin') {
    query.referredBy = req.user.referralCode;
  }

  // Execute query with aggregation for better performance
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordHistory')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(query)
  ]);

  // Create pagination metadata
  const paginationMeta = createPaginationMeta(
    pagination.page,
    pagination.limit,
    total
  );

  return sendPaginatedResponse(res, users, paginationMeta, 'Users fetched successfully');
});

/**
 * Get user by ID
 * GET /api/users/:userId
 */
exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return sendError(res, 'User ID is required', 400);
  }

  const user = await User.findOne({ userId })
    .select('-password -passwordHistory -loginAttempts -lockUntil');

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Check if user has permission to view this profile
  if (req.user && req.user.role !== 'Admin' && user.referredBy !== req.user.referralCode) {
    return sendUnauthorized(res, 'You do not have permission to view this user');
  }

  return sendSuccess(res, user, 'User fetched successfully');
});

/**
 * Create new user
 * POST /api/users
 */
exports.createUser = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error, value } = validateUserRegistration(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return sendValidationError(res, errors);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { userId: value.userId },
      { 'phone.number': value.phone }
    ]
  });

  if (existingUser) {
    return sendError(res, 'User with this ID or phone already exists', 409);
  }

  // Create user
  const user = await User.create({
    ...value,
    referralCode: generateReferralCode(), // Implement this function
    referredBy: value.referredBy || null
  });

  // Remove sensitive data from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.passwordHistory;

  logger.info('User created', {
    userId: user.userId,
    createdBy: req.user?.userId
  });

  return sendSuccess(res, userResponse, 'User created successfully', 201);
});

/**
 * Update user profile
 * PUT /api/users/:userId
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Validate request body
  const { error, value } = validateProfileUpdate(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return sendValidationError(res, errors);
  }

  // Find user
  const user = await User.findOne({ userId });

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Check permission (user can only update their own profile, except admins)
  if (req.user && req.user.userId !== userId && req.user.role !== 'Admin') {
    return sendUnauthorized(res, 'You do not have permission to update this user');
  }

  // Update fields (only provided ones)
  const allowedUpdates = ['firstName', 'lastName', 'birthday', 'phone', 'country', 'email'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (value[field] !== undefined) {
      updates[field] = value[field];
    }
  });

  // Add update timestamp
  updates.updatetimestamp = new Date();

  // Update user
  const updatedUser = await User.findOneAndUpdate(
    { userId },
    updates,
    { new: true, runValidators: true }
  ).select('-password -passwordHistory');

  logger.info('User updated', {
    userId,
    updatedBy: req.user?.userId,
    fields: Object.keys(updates)
  });

  return sendSuccess(res, updatedUser, 'User updated successfully');
});

/**
 * Delete user (soft delete)
 * DELETE /api/users/:userId
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId });

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Soft delete - just mark as inactive
  user.isActive = false;
  user.deactivatedAt = new Date();
  user.deactivatedBy = req.user?.userId;
  await user.save();

  logger.info('User deactivated', {
    userId,
    deactivatedBy: req.user?.userId
  });

  return sendSuccess(res, null, 'User deactivated successfully');
});

/**
 * Change user password
 * POST /api/users/:userId/change-password
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Validate request body
  const { error, value } = validatePasswordChange(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return sendValidationError(res, errors);
  }

  const user = await User.findOne({ userId }).select('+password');

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Verify current password
  const isMatch = await user.comparePassword(value.currentPassword);
  if (!isMatch) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Check password history to prevent reuse
  if (user.passwordHistory?.length) {
    const recentPasswords = user.passwordHistory.slice(-3);
    for (const old of recentPasswords) {
      const isOld = await user.comparePassword(value.newPassword);
      if (isOld) {
        return sendError(res, 'Cannot reuse recent passwords', 400);
      }
    }
  }

  // Update password
  user.password = value.newPassword;
  user.passwordChangedAt = new Date();
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  
  // Add to password history
  if (!user.passwordHistory) user.passwordHistory = [];
  user.passwordHistory.push({
    password: user.password,
    changedAt: new Date()
  });
  
  // Keep only last 5 passwords
  if (user.passwordHistory.length > 5) {
    user.passwordHistory = user.passwordHistory.slice(-5);
  }

  await user.save();

  logger.info('Password changed', {
    userId,
    changedBy: req.user?.userId
  });

  return sendSuccess(res, null, 'Password changed successfully');
});

/**
 * Get user balance
 * GET /api/users/:userId/balance
 */
exports.getUserBalance = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId }).select('balance bonus');

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Check permission
  if (req.user && req.user.userId !== userId && req.user.role !== 'Admin') {
    return sendUnauthorized(res, 'You do not have permission to view this balance');
  }

  return sendSuccess(res, {
    balance: user.balance,
    bonus: user.bonus || { active: false, bonusAmount: 0 }
  }, 'Balance fetched successfully');
});

/**
 * Update user balance (admin only)
 * PUT /api/users/:userId/balance
 */
exports.updateUserBalance = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { amount, type, reason } = req.body;

  // Validate input
  if (!amount || !type || !['add', 'deduct'].includes(type)) {
    return sendError(res, 'Valid amount and type (add/deduct) are required', 400);
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return sendError(res, 'Amount must be a positive number', 400);
  }

  const user = await User.findOne({ userId });

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Update balance
  if (type === 'add') {
    user.balance += amountNum;
  } else {
    if (user.balance < amountNum) {
      return sendError(res, 'Insufficient balance', 400);
    }
    user.balance -= amountNum;
  }

  await user.save();

  logger.info('Balance updated', {
    userId,
    type,
    amount: amountNum,
    reason,
    updatedBy: req.user?.userId,
    newBalance: user.balance
  });

  return sendSuccess(res, { balance: user.balance }, 'Balance updated successfully');
});

/**
 * Search users with advanced filters
 * POST /api/users/search
 */
exports.searchUsers = catchAsync(async (req, res, next) => {
  // Validate search query
  const { error, value } = validateSearchQuery(req.body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));
    return sendValidationError(res, errors);
  }

  // Build filters
  const filters = {};
  
  if (value.userId) filters.userId = { $regex: value.userId, $options: 'i' };
  if (value.email) filters.email = { $regex: value.email, $options: 'i' };
  if (value.status !== undefined) filters.isActive = value.status === 1;
  
  // Date range filter
  if (value.startDate || value.endDate) {
    filters.createdAt = {};
    if (value.startDate) filters.createdAt.$gte = new Date(value.startDate);
    if (value.endDate) filters.createdAt.$lte = new Date(value.endDate);
  }

  // Amount range filter
  if (value.minAmount || value.maxAmount) {
    filters.balance = {};
    if (value.minAmount) filters.balance.$gte = parseFloat(value.minAmount);
    if (value.maxAmount) filters.balance.$lte = parseFloat(value.maxAmount);
  }

  // Pagination
  const page = parseInt(value.page) || 1;
  const limit = parseInt(value.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = value.sortBy || 'createdAt';
  const sortOrder = value.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const [users, total] = await Promise.all([
    User.find(filters)
      .select('-password -passwordHistory')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filters)
  ]);

  const pagination = createPaginationMeta(page, limit, total);

  return sendPaginatedResponse(res, users, pagination, 'Search results fetched successfully');
});

/**
 * Get user statistics
 * GET /api/users/:userId/stats
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId });

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Calculate additional stats
  const stats = {
    userId: user.userId,
    name: user.name,
    balance: user.balance,
    isActive: user.isActive,
    isVerified: user.isVerified,
    accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
    lastLogin: user.last_login,
    kycStatus: user.kyc?.status || 'not_submitted',
    bonusStatus: user.bonus?.active || false
  };

  return sendSuccess(res, stats, 'User stats fetched successfully');
});

/**
 * Export users (CSV/JSON)
 * GET /api/users/export
 */
exports.exportUsers = catchAsync(async (req, res, next) => {
  const { format = 'json', fields } = req.query;

  // Build query
  const query = {};
  if (req.user && req.user.role !== 'Admin') {
    query.referredBy = req.user.referralCode;
  }

  // Select fields to export
  const selectFields = fields 
    ? fields.split(',').join(' ') 
    : '-password -passwordHistory';

  const users = await User.find(query)
    .select(selectFields)
    .lean();

  if (format === 'csv') {
    // Convert to CSV
    if (users.length === 0) {
      return res.status(200).send('');
    }

    const headers = Object.keys(users[0]).join(',');
    const rows = users.map(user => 
      Object.values(user).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users_${Date.now()}.csv`);
    return res.status(200).send([headers, ...rows].join('\n'));
  }

  return sendSuccess(res, users, 'Users exported successfully');
});

/**
 * Bulk user operations
 * POST /api/users/bulk
 */
exports.bulkUserOperation = catchAsync(async (req, res, next) => {
  const { operation, userIds, data } = req.body;

  if (!operation || !userIds || !Array.isArray(userIds)) {
    return sendError(res, 'Operation and user IDs are required', 400);
  }

  let result;

  switch (operation) {
    case 'activate':
      result = await User.updateMany(
        { userId: { $in: userIds } },
        { isActive: true }
      );
      break;

    case 'deactivate':
      result = await User.updateMany(
        { userId: { $in: userIds } },
        { isActive: false }
      );
      break;

    case 'delete':
      result = await User.updateMany(
        { userId: { $in: userIds } },
        { isActive: false, deactivatedAt: new Date() }
      );
      break;

    default:
      return sendError(res, 'Invalid operation', 400);
  }

  logger.info('Bulk user operation', {
    operation,
    count: userIds.length,
    performedBy: req.user?.userId
  });

  return sendSuccess(res, {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  }, `Bulk ${operation} operation completed successfully`);
});

