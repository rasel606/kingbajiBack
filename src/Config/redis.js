

//       // Test connection with simple command
//       await this.client.connect();
//       await this.client.ping(); // Test connection
//       console.log('Redis connection test successful');
      
//     } catch (error) {
//       console.error('Failed to initialize Redis client:', error.message);
//       this.isConnected = false;
//       // Don't throw, just continue without Redis
//     }
//   }

//   async ensureConnection() {
//     if (this.isConnected) return true;
//     return false;
//   }

//   async get(key) {
//     try {
//       if (!this.isConnected) return null;
//       const data = await this.client.get(key);
//       return data ? JSON.parse(data) : null;
//     } catch (error) {
//       console.error('Redis get error:', error.message);
//       return null;
//     }
//   }

//   async set(key, value, expireSeconds = null) {
//     try {
//       if (!this.isConnected) return false;
//       const stringValue = JSON.stringify(value);
//       if (expireSeconds) {
//         await this.client.setEx(key, expireSeconds, stringValue);
//       } else {
//         await this.client.set(key, stringValue);
//       }
//       return true;
//     } catch (error) {
//       console.error('Redis set error:', error.message);
//       return false;
//     }
//   }

//   async del(key) {
//     try {
//       if (!this.isConnected) return false;
//       await this.client.del(key);
//       return true;
//     } catch (error) {
//       console.error('Redis delete error:', error.message);
//       return false;
//     }
//   }

//   async disconnect() {
//     if (this.client && this.isConnected) {
//       await this.client.quit();
//       this.isConnected = false;
//     }
//   }

//   // Generate cache keys
//   generateEarningsKey(affiliateId, currency) {
//     return `affiliate:${affiliateId}:earnings:${currency}`;
//   }

//   generateRevenueKey(affiliateId, currency) {
//     return `affiliate:${affiliateId}:revenue:${currency}`;
//   }

//   generateReferredUsersKey(affiliateId) {
//     return `affiliate:${affiliateId}:referredUsers`;
//   }
// }

// // Create singleton instance
// const redisClient = new RedisClient();

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await redisClient.disconnect();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   await redisClient.disconnect();
//   process.exit(0);
// });

// module.exports = redisClient;