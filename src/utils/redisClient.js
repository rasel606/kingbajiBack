const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionPromise = null;
    this.init();
  }

  async init() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:3000',
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB) || 0,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.log('Too many retries on Redis. Connection terminated');
              return new Error('Too many retries');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connecting...');
      });

      this.client.on('ready', () => {
        console.log('Redis Client Connected and Ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      this.isConnected = false;
    }
  }

  async ensureConnection() {
    if (this.isConnected) return true;
    
    if (!this.connectionPromise) {
      this.connectionPromise = this.init();
    }
    
    try {
      await this.connectionPromise;
      this.connectionPromise = null;
      return this.isConnected;
    } catch (error) {
      this.connectionPromise = null;
      return false;
    }
  }

  async get(key) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, returning null for get');
        return null;
      }
      
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, expireSeconds = null) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, skip set');
        return false;
      }
      
      const stringValue = JSON.stringify(value);
      if (expireSeconds) {
        await this.client.setEx(key, expireSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, skip delete');
        return false;
      }
      
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, skip expire');
        return false;
      }
      
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, returning false for exists');
        return false;
      }
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async keys(pattern) {
    try {
      if (!await this.ensureConnection()) {
        console.warn('Redis not connected, returning empty array for keys');
        return [];
      }
      
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  // Generate cache key for affiliate earnings
  generateEarningsKey(affiliateId, currency) {
    return `affiliate:${affiliateId}:earnings:${currency}`;
  }

  // Generate cache key for affiliate revenue
  generateRevenueKey(affiliateId, currency) {
    return `affiliate:${affiliateId}:revenue:${currency}`;
  }

  // Generate cache key for referred users
  generateReferredUsersKey(affiliateId) {
    return `affiliate:${affiliateId}:referredUsers`;
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisClient.disconnect();
  process.exit(0);
});

module.exports = redisClient;