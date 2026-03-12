// Unified Dashboard Routes - Complete Integration
const express = require('express');
const router = express.Router();
const UnifiedDashboardController = require('../controllers/UnifiedDashboardController');
const { auth } = require('../middleWare/auth'); // Fixed: destructured import
const adminAuth = require('../middleWare/adminAuth');

// =============================================
// MAIN UNIFIED DASHBOARD ROUTE
// =============================================
/**
 * @route GET /api/unified-dashboard
 * @desc Get complete unified dashboard with all modules
 * @query startDate - Start date for date range (optional)
 * @query endDate - End date for date range (optional)
 * @query timeZone - Timezone (default: UTC)
 * @query modules - Comma-separated list of modules or 'all' (default: all)
 * @access Private (Admin)
 */
router.get('/', auth, UnifiedDashboardController.getUnifiedDashboard);

// ⚡ OPTIMIZED: Fast summary endpoint (single API call)
/**
 * @route GET /api/unified-dashboard/summary
 * @desc Get optimized unified dashboard summary with all critical data in one call
 * @query startDate - Start date for date range (optional)
 * @query endDate - End date for date range (optional)
 * @query timeZone - Timezone (default: UTC)
 * @access Private (Admin)
 */
router.get('/summary', auth, UnifiedDashboardController.getOptimizedSummary);

// Advanced programmatic summary (no cache flag) - returns full JSON for integrations
router.get('/summary/advanced', auth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC',
    );
    const data = await UnifiedDashboardController.fetchOptimizedData(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Prometheus-style metrics endpoint for observability
router.get('/metrics', auth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC',
    );
    const data = await UnifiedDashboardController.fetchOptimizedData(dateRange);
    const m = data.summary;
    const lines = [
      `# HELP unified_total_users Total registered users`,
      `# TYPE unified_total_users gauge`,
      `unified_total_users ${m.totalUsers || 0}`,
      `# HELP unified_active_users Active users in last 24h`,
      `# TYPE unified_active_users gauge`,
      `unified_active_users ${m.activeUsers || 0}`,
      `# HELP unified_revenue_total Revenue in selected range`,
      `# TYPE unified_revenue_total gauge`,
      `unified_revenue_total ${parseFloat(m.revenue || 0)}`,
      `# HELP unified_profit Profit in selected range`,
      `# TYPE unified_profit gauge`,
      `unified_profit ${parseFloat(m.profit || 0)}`,
    ];

    res.set('Content-Type', 'text/plain');
    res.send(lines.join('\n'));
  } catch (error) {
    res.status(500).send(`# error\n# ${error.message}`);
  }
});

// =============================================
// MODULE-SPECIFIC ROUTES
// =============================================

/**
 * @route GET /api/unified-dashboard/users
 * @desc Get users module data
 * @access Private (Admin)
 */
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getUsersModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/transactions
 * @desc Get transactions module data
 * @access Private (Admin)
 */
router.get('/transactions', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getTransactionsModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/betting
 * @desc Get betting module data
 * @access Private (Admin)
 */
router.get('/betting', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getBettingModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/affiliates
 * @desc Get affiliates module data
 * @access Private (Admin)
 */
router.get('/affiliates', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getAffiliatesModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/agents
 * @desc Get agents module data
 * @access Private (Admin)
 */
router.get('/agents', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getAgentsModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/games
 * @desc Get games module data
 * @access Private (Admin)
 */
router.get('/games', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getGamesModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/finance
 * @desc Get finance module data
 * @access Private (Admin)
 */
router.get('/finance', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getFinanceModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/security
 * @desc Get security module data
 * @access Private (Admin)
 */
router.get('/security', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getSecurityModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/promotions
 * @desc Get promotions module data
 * @access Private (Admin)
 */
router.get('/promotions', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getPromotionsModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/vip
 * @desc Get VIP module data
 * @access Private (Admin)
 */
router.get('/vip', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getVIPModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/analytics
 * @desc Get analytics module data
 * @access Private (Admin)
 */
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const dateRange = UnifiedDashboardController.getDateRange(
      req.query.startDate,
      req.query.endDate,
      req.query.timeZone || 'UTC'
    );
    const data = await UnifiedDashboardController.getAnalyticsModule(dateRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/realtime
 * @desc Get real-time statistics
 * @access Private (Admin)
 */
router.get('/realtime', auth, adminAuth, async (req, res) => {
  try {
    const data = await UnifiedDashboardController.getRealtimeStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/unified-dashboard/system-health
 * @desc Get system health status
 * @access Private (Admin)
 */
router.get('/system-health', auth, adminAuth, async (req, res) => {
  try {
    const data = await UnifiedDashboardController.getSystemHealth();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
