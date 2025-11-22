// services/fallbackCache.js
class FallbackCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const expires = this.ttl.get(key);
    if (expires && Date.now() > expires) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return item;
  }

  async set(key, value, ttlSeconds = null) {
    this.cache.set(key, value);
    if (ttlSeconds) {
      this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    }
    return true;
  }

  async del(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    return true;
  }

  async expire(key, seconds) {
    if (this.cache.has(key)) {
      this.ttl.set(key, Date.now() + (seconds * 1000));
      return true;
    }
    return false;
  }

  async exists(key) {
    return this.cache.has(key);
  }
}

module.exports = FallbackCache;