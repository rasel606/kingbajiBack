const cron = require('node-cron');
const UnifiedDashboardController = require('../controllers/UnifiedDashboardController');

// Run every minute by default (can be changed in CRON_SCHEDULE env)
const schedule = process.env.DASHBOARD_CACHE_CRON || '*/1 * * * *';

const refreshCache = async () => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7); // last 7 days

    const dateRange = { start, end: now };
    console.log('🔁 Refreshing unified dashboard cache for range', dateRange.start.toISOString(), '-', dateRange.end.toISOString());

    const data = await UnifiedDashboardController.fetchOptimizedData(dateRange);
    const cacheKey = `unified:summary:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`;
    const ttl = parseInt(process.env.CACHE_TTL, 10) || 300;
    await UnifiedDashboardController.setToCache(cacheKey, data, ttl);

    // Optionally emit via socket if available on app (best-effort)
    try {
      const app = require('../../app');
      const io = app.get('io');
      if (io && io.emit) {
        io.emit('dashboard:cache_refreshed', { timestamp: new Date(), summary: data.summary });
      }
    } catch (e) {
      // app not available here or emit failed
    }

    console.log('✅ Dashboard cache refreshed');
  } catch (err) {
    console.error('❌ Dashboard cache refresh failed:', err.message);
  }
};

const scheduleJobs = () => {
  cron.schedule(schedule, refreshCache);
  console.log('⏰ Dashboard cache refresher scheduled:', schedule);
};

module.exports = { scheduleJobs, refreshCache };
