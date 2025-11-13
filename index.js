// // index.js
// require('dotenv').config();
// const { server } = require('./app');
// const logger = require('./src/utils/logger');

// const PORT = process.env.PORT || 5000;
// const HOST = process.env.HOST || '0.0.0.0';

// console.log('🚀 Starting BajiCrick Server...', {
//   environment: process.env.NODE_ENV || 'development',
//   port: PORT,
//   host: HOST,
//   timestamp: new Date().toISOString()
// });

// // Start server
// server.listen(PORT, HOST, () => {
//   console.log('🎉 Server started successfully!');
//   console.log(`📍 Port: ${PORT}`);
//   console.log(`🌍 Host: ${HOST}`);
//   console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
//   logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
//   logger.info(`🔌 Socket.io is ready for real-time connections`);
//   logger.info(`💬 Live Chat System is initialized`);
// });

// // Graceful shutdown handlers
// // const gracefulShutdown = (signal) => {
// //   return () => {
// //     console.log(`\n📝 ${signal} received. Shutting down gracefully...`);
// //     logger.info(`${signal} received. Shutting down gracefully`);
    
// //     server.close(() => {
// //       console.log('✅ HTTP server closed');
// //       logger.info('HTTP server closed');
      
// //       // Close MongoDB connection
// //       const mongoose = require('mongoose');
// //       if (mongoose.connection.readyState === 1) {
// //         mongoose.connection.close(false, () => {
// //           console.log('✅ MongoDB connection closed');
// //           logger.info('MongoDB connection closed');
// //           process.exit(0);
// //         });
// //       } else {
// //         process.exit(0);
// //       }
// //     });

// //     // Force close after 10 seconds
// //     setTimeout(() => {
// //       console.log('❌ Forcing shutdown after timeout');
// //       logger.error('Forcing shutdown after timeout');
// //       process.exit(1);
// //     }, 10000);
// //   };
// // };

// // // Handle various shutdown signals
// // process.on('SIGTERM', gracefulShutdown('SIGTERM'));
// // process.on('SIGINT', gracefulShutdown('SIGINT'));
// // process.on('SIGUSR2', gracefulShutdown('SIGUSR2')); // For nodemon
// // Graceful shutdown handlers
// const gracefulShutdown = (signal) => {
//   return async () => {
//     console.log(`\n📝 ${signal} received. Shutting down gracefully...`);
//     logger.info(`${signal} received. Shutting down gracefully`);

//     try {
//       // Close HTTP server
//       await new Promise((resolve, reject) => {
//         server.close((err) => {
//           if (err) return reject(err);
//           console.log('✅ HTTP server closed');
//           logger.info('HTTP server closed');
//           resolve();
//         });
//       });

//       // Close MongoDB connection
//       const mongoose = require('mongoose');
//       if (mongoose.connection.readyState === 1) {
//         await mongoose.connection.close();
//         console.log('✅ MongoDB connection closed');
//         logger.info('MongoDB connection closed');
//       }

//       process.exit(0);
//     } catch (err) {
//       console.error('❌ Error during shutdown:', err);
//       logger.error('Error during shutdown', { error: err.message, stack: err.stack });
//       process.exit(1);
//     }

//     // Force close after 10 seconds (fallback)
//     setTimeout(() => {
//       console.log('❌ Forcing shutdown after timeout');
//       logger.error('Forcing shutdown after timeout');
//       process.exit(1);
//     }, 10000);
//   };
// };

// // Handle various shutdown signals
// process.on('SIGTERM', gracefulShutdown('SIGTERM'));
// process.on('SIGINT', gracefulShutdown('SIGINT'));
// process.on('SIGUSR2', gracefulShutdown('SIGUSR2')); // For nodemon

// // Handle uncaught exceptions and rejections
// process.on('uncaughtException', (error) => {
//   console.error('❌ Uncaught Exception:', error);
//   logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//   logger.error('Unhandled Rejection', { reason: reason?.message, stack: reason?.stack });
//   process.exit(1);
// });

// console.log('✅ Server startup configuration completed');


// index.js
require('dotenv').config();
const { server } = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting BajiCrick Server...', {
  environment: process.env.NODE_ENV || 'development',
  port: PORT,
  host: HOST,
  timestamp: new Date().toISOString()
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('🎉 Server started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Host: ${HOST}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`🔌 Socket.io is ready for real-time connections`);
  logger.info(`💬 Live Chat System is initialized`);
});

const gracefulShutdown = (signal) => {
  return async () => {
    console.log(`\n📝 ${signal} received. Shutting down gracefully...`);
    logger.info(`${signal} received. Shutting down gracefully`);

    try {
      // Close HTTP server
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log('✅ HTTP server closed');
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // Close MongoDB connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        logger.info('MongoDB connection closed');
      }

      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      logger.error('Error during shutdown', { error: err.message, stack: err.stack });
      process.exit(1);
    }

    // Force close after 10 seconds (fallback)
    setTimeout(() => {
      console.log('❌ Forcing shutdown after timeout');
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
};

// Handle various shutdown signals
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));
process.on('SIGUSR2', gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection', { reason: reason?.message, stack: reason?.stack });
  process.exit(1);
});

console.log('✅ Server startup configuration completed');
