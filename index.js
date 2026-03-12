// // ==============================
// index.js - BajiCrick Backend
// ==============================
require('dotenv').config();
const { server } = require('./app');
const logger = require('./src/utils/logger');
const mongoose = require('mongoose');

// Configure mongoose index behavior to avoid duplicate-index warnings during startup.
// In production you may want to disable autoIndex entirely and manage indexes via migrations.
if (process.env.MONGOOSE_AUTO_INDEX === 'false' || process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false)
  console.log('Mongoose autoIndex disabled (production/migration mode)')
} else {
  mongoose.set('autoIndex', true)
  console.log('Mongoose autoIndex enabled (development mode)')
}

// ------------------------------
// Environment Configuration
// ------------------------------
// Force port 5000 for frontend compatibility
const PORT = 5000;
const HOST = process.env.HOST || '0.0.0.0';
const ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting BajiCrick Server...', {
  environment: ENV,
  port: PORT,
  host: HOST,
  timestamp: new Date().toISOString(),
});

// ------------------------------
// Start HTTP Server
// ------------------------------
server.listen(PORT, HOST, () => {
  console.log('🎉 Server started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Host: ${HOST}`);
  console.log(`🔧 Environment: ${ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  logger.info(`🚀 Server running in ${ENV} mode on port ${PORT}`);
  logger.info(`🔌 Socket.io is ready for real-time connections`);
  logger.info(`💬 Live Chat System is initialized`);
});

console.log('✅ Server startup configuration completed');

// Start dashboard cache refresher cron (best-effort)
try {
  const { scheduleJobs } = require('./src/corn/dashboardCacheRefresher');
  scheduleJobs();
} catch (e) {
  console.warn('Unable to start dashboard cache refresher:', e.message);
}

// Try to connect Redis (best-effort). Uses src/redisClient.js which falls back to in-memory cache if unavailable.
try {
  const { connectRedis } = require('./src/redisClient')
  connectRedis().catch((e) => console.warn('Redis connect rejected:', e && e.message))
} catch (e) {
  console.warn('Redis client not configured:', e && e.message)
}

// ------------------------------
// Graceful Shutdown Handler
// ------------------------------
const gracefulShutdown = (signal) => {
  return async () => {
    console.log(`\n📝 ${signal} received. Shutting down gracefully...`);
    logger.info(`${signal} received. Shutting down gracefully`);

    try {
      // 1️⃣ Stop accepting new connections
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log('✅ HTTP server closed');
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // 2️⃣ Close MongoDB connection (if open)
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        logger.info('MongoDB connection closed');
      }

      console.log('👋 Shutdown complete. Exiting now...');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      logger.error('Error during shutdown', {
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    }

    // 3️⃣ Fallback timeout (force exit)
    setTimeout(() => {
      console.log('❌ Forcing shutdown after timeout');
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
};

// ------------------------------
// Process Signal Handlers
// ------------------------------
['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach((signal) => {
  process.on(signal, gracefulShutdown(signal));
});

// ------------------------------
// Error Handlers
// ------------------------------
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  logger.error('Unhandled Rejection', {
    reason: reason?.message,
    stack: reason?.stack,
  });
  process.exit(1);
});
