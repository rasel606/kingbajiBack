// Dashboard Caching Service
const NodeCache = require('node-cache');

class DashboardCacheService {
  constructor(stdTTL = 300) { // 5 minutes default TTL
    this.cache = new NodeCache({ stdTTL, checkperiod: 60 });
    this.setupCacheMonitoring();
  }

  /**
   * Cache Key Generator
   */
  generateKey(metric, params = {}) {
    const keys = [
      `dashboard:${metric}`,
      params.startDate ? `${params.startDate}` : '',
      params.endDate ? `${params.endDate}` : '',
      params.timeZone ? `${params.timeZone}` : '',
      params.interval ? `${params.interval}` : ''
    ];
    return keys.filter(k => k).join(':');
  }

  /**
   * Get Cached Data
   */
  get(metric, params = {}) {
    const key = this.generateKey(metric, params);
    const data = this.cache.get(key);
    if (data) {
      console.log(`✅ Cache HIT: ${key}`);
      return data;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set Cached Data
   */
  set(metric, data, params = {}, ttl = null) {
    const key = this.generateKey(metric, params);
    const success = ttl ? this.cache.set(key, data, ttl) : this.cache.set(key, data);
    if (success) {
      console.log(`💾 Cached: ${key}`);
    }
    return success;
  }

  /**
   * Delete Specific Cache
   */
  delete(metric, params = {}) {
    const key = this.generateKey(metric, params);
    this.cache.del(key);
    console.log(`🗑️ Cache deleted: ${key}`);
  }

  /**
   * Clear All Cache
   */
  clearAll() {
    this.cache.flushAll();
    console.log('🗑️ All cache cleared');
  }

  /**
   * Clear Cache Pattern (e.g., dashboard:metrics:*)
   */
  clearPattern(pattern) {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let count = 0;

    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.del(key);
        count++;
      }
    });

    console.log(`🗑️ Cleared ${count} cache items matching pattern: ${pattern}`);
    return count;
  }

  /**
   * Get Cache Statistics
   */
  getStats() {
    return {
      keys: this.cache.keys().length,
      kv: this.cache.getStats(),
      hitrate: this.cache.getStats().hits / (this.cache.getStats().hits + this.cache.getStats().misses) || 0
    };
  }

  /**
   * Setup Cache Monitoring
   */
  setupCacheMonitoring() {
    // Log cache stats every 5 minutes
    setInterval(() => {
      const stats = this.getStats();
      console.log('📊 Cache Statistics:', {
        totalKeys: stats.keys,
        hitRate: (stats.hitrate * 100).toFixed(2) + '%',
        ...stats.kv
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Cache Invalidation Methods
   */

  invalidateMetrics() {
    this.clearPattern('dashboard:metrics:.*');
  }

  invalidateTimeSeries() {
    this.clearPattern('dashboard:timeseries:.*');
  }

  invalidateRevenue() {
    this.clearPattern('dashboard:revenue:.*');
  }

  invalidateUsers() {
    this.clearPattern('dashboard:users:.*');
  }

  invalidateBetting() {
    this.clearPattern('dashboard:betting:.*');
  }

  invalidateTransactions() {
    this.clearPattern('dashboard:transactions:.*');
  }

  invalidatePerformance() {
    this.clearPattern('dashboard:performance:.*');
  }

  invalidateAffiliate() {
    this.clearPattern('dashboard:affiliate:.*');
  }

  /**
   * Cache with Fetch
   * Attempts to get from cache, fetches if missing
   */
  async getOrFetch(metric, params, fetchFunction, ttl = null) {
    try {
      // Check cache first
      const cached = this.get(metric, params);
      if (cached) {
        return cached;
      }

      // Fetch new data
      const fresh = await fetchFunction();

      // Cache the result
      this.set(metric, fresh, params, ttl);

      return fresh;
    } catch (error) {
      console.error(`Error in getOrFetch for ${metric}:`, error);
      throw error;
    }
  }

  /**
   * Batch Cache Get
   */
  getMultiple(requests) {
    return requests.map(req => ({
      metric: req.metric,
      params: req.params,
      data: this.get(req.metric, req.params)
    }));
  }

  /**
   * Batch Cache Set
   */
  setMultiple(requests) {
    return requests.map(req => ({
      metric: req.metric,
      success: this.set(req.metric, req.data, req.params, req.ttl)
    }));
  }
}

// Create singleton instance
const dashboardCache = new DashboardCacheService(300); // 5 minutes TTL

module.exports = dashboardCache;
