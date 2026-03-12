const catchAsync = require('../utils/catchAsync');
const DashboardService = require('../services/DashboardService');
const AppError = require('../utils/AppError');

exports.getAdvancedDashboard = catchAsync(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? { startDate, endDate } : null;
    
    const metrics = await DashboardService.getAdvancedMetrics(dateRange);
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(new AppError(`Dashboard error: ${error.message}`, 500));
  }
});

exports.getUnifiedDashboard = catchAsync(async (req, res, next) => {
  // Similar to advanced but with hierarchy drill-down
  const metrics = await DashboardService.getAdvancedMetrics();
  
  // Add hierarchy-specific breakdowns
  res.status(200).json({
    success: true,
    data: {
      ...metrics,
      hierarchy: {
        agents: await DashboardService.getHierarchyStats('agent'),
        subAgents: await DashboardService.getHierarchyStats('subagent'),
        affiliates: await DashboardService.getHierarchyStats('affiliate')
      }
    }
  });
});

exports.getRealtimeStats = catchAsync(async (req, res, next) => {
  const stats = await DashboardService.getRealtimeStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.getProviderStats = catchAsync(async (req, res, next) => {
  const stats = await DashboardService.getProviderStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.getTimeSeriesData = catchAsync(async (req, res, next) => {
  const { startDate, endDate, interval = 'daily', metric = 'revenue' } = req.query;
  
  const data = await DashboardService.getTimeSeriesData({ 
    startDate, 
    endDate, 
    interval, 
    metric 
  });
  
  res.status(200).json({
    success: true,
    data
  });
});

// Placeholder for hierarchy stats (extend service later)
DashboardService.getHierarchyStats = async (type) => {
  // Implement based on type: agent/subagent/affiliate
  return { total: 0, revenue: 0, users: 0 };
};

