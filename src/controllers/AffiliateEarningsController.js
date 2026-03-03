const EarningsService = require('../services/AffiliateEarningsService');
const AffiliateRevenueService = require('../services/AffilateRevenueService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const CommissionService = require('../services/CommissionService');
exports.getEarningsData = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { currency = 'BDT' } = req.query;
  
  const earningsData = await EarningsService.calculateEarnings(userId, currency);
  
  res.status(200).json({
    success: true,
    data: earningsData
  });
});

exports.getRevenueData = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { currency = 'BDT' } = req.query;

  const revenueData = await AffiliateRevenueService.calculateRevenueByGameType(userId, currency);
  
  res.status(200).json({
    success: true,
    data: revenueData
  });
});

exports.refreshEarningsData = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { currency = 'BDT' } = req.body;

  // Force recalculation of earnings
  const earningsData = await EarningsService.calculateEarnings(userId, currency, true);
  
  res.status(200).json({
    success: true,
    message: 'Earnings data refreshed successfully',
    data: earningsData
  });
});

exports.getCacheStats = catchAsync(async (req, res, next) => {
  // const redisClient = require('../utils/redisClient');
  // const stats = redisClient.getStatus();
  const stats = true; // Placeholder for actual stats retrieval logic
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.clearCache = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { cacheType } = req.body;
  
  if (cacheType === 'earnings') {
    await EarningsService.invalidateEarningsCache(userId);
  } else if (cacheType === 'revenue') {
    await AffiliateRevenueService.invalidateRevenueCache(userId);
  } else {
    await EarningsService.invalidateEarningsCache(userId);
    await AffiliateRevenueService.invalidateRevenueCache(userId);
  }
  
  res.status(200).json({
    success: true,
    message: 'Cache cleared successfully'
  });
});





exports.getCommissions = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { 
    startTime, 
    endTime, 
    currencyTypeId = 8, 
    page = 1, 
    limit = 10 
  } = req.query;

  const filters = {
    startTime,
    endTime,
    currencyTypeId: parseInt(currencyTypeId),
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await CommissionService.getCommissions(userId, filters);
  
  res.status(200).json({
    success: true,
    data: result.commissions,
    pagination: result.pagination
  });
});

exports.getDownlineCommissions = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { 
    startTime, 
    endTime, 
    currencyTypeId = 8, 
    page = 1, 
    limit = 10 
  } = req.query;

  const filters = {
    startTime,
    endTime,
    currencyTypeId: parseInt(currencyTypeId),
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await CommissionService.getDownlineCommissions(userId, filters);
  
  res.status(200).json({
    success: true,
    data: result.commissions,
    pagination: result.pagination
  });
});

exports.getCommissionDetails = catchAsync(async (req, res, next) => {
  const { commissionId } = req.params;
  
  const commissionDetails = await CommissionService.getCommissionDetails(commissionId);
  
  res.status(200).json({
    success: true,
    data: commissionDetails
  });
});