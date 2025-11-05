
// require('dotenv').config();
// const { server } = require('./app');
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');
// const connectDB = require('./src/Config/db');

// console.log('🚀 Starting server...', {
//   environment: config.environment,
//   port: config.port,
//   nodeEnv: process.env.NODE_ENV,
//   timestamp: new Date().toISOString()
// });

// // Connect to DB
// console.log('🔗 Connecting to database...');
// connectDB();

// // Start server
// server.listen(config.port, () => {
//   console.log('🎉 Server started successfully:', {
//     port: config.port,
//     environment: config.environment,
//     timestamp: new Date().toISOString()
//   });

//   console.log('🚀 Server running in', config.environment, 'mode on port', config.port);
//   console.log('🔌 Socket.io is ready for real-time connections');
//   console.log('💬 Live Chat System is initialized');
//   console.log('🌐 CORS enabled for: http://localhost:3000, http://localhost:3001');
//   console.log('📊 Socket monitoring available at /api/socket/health');
  
//   logger.info(`🚀 Server running in ${config.environment} mode on port ${config.port}`);
//   logger.info(`🔌 Socket.io is ready for real-time connections`);
//   logger.info(`💬 Live Chat System is initialized`);
//   logger.info(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001`);
//   logger.info(`📊 Socket monitoring available at /api/socket/health`);
// });

// // Graceful shutdown & error handling
// process.on('unhandledRejection', (err) => {
//   console.error('❌ Unhandled Rejection:', {
//     error: err.message,
//     stack: err.stack,
//     timestamp: new Date().toISOString()
//   });
  
//   logger.error(`❌ Unhandled Rejection: ${err.message}`, err);
//   server.close(() => {
//     console.log('🔒 Server closed due to unhandled rejection');
//     process.exit(1);
//   });
// });

// process.on('uncaughtException', (err) => {
//   console.error('❌ Uncaught Exception:', {
//     error: err.message,
//     stack: err.stack,
//     timestamp: new Date().toISOString()
//   });
  
//   logger.error(`❌ Uncaught Exception: ${err.message}`, err);
//   server.close(() => {
//     console.log('🔒 Server closed due to uncaught exception');
//     process.exit(1);
//   });
// });

// process.on('SIGTERM', () => {
//   console.log('📝 SIGTERM received. Shutting down gracefully...', {
//     timestamp: new Date().toISOString()
//   });
  
//   logger.info('📝 SIGTERM received. Shutting down gracefully');
//   server.close(() => {
//     console.log('✅ Process terminated gracefully');
//     logger.info('✅ Process terminated');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('📝 SIGINT received. Shutting down...', {
//     timestamp: new Date().toISOString()
//   });
  
//   logger.info('📝 SIGINT received. Shutting down');
//   server.close(() => {
//     console.log('✅ Process terminated by user');
//     logger.info('✅ Process terminated by user');
//     process.exit(0);
//   });
// });

// // Socket.io specific cleanup
// process.on('exit', (code) => {
//   console.log('🔌 Process exiting with code:', {
//     code,
//     timestamp: new Date().toISOString()
//   });
//   logger.info(`🔌 Process exiting with code: ${code}`);
// });

// console.log('✅ Server startup configuration completed');



// // index.js
// require('dotenv').config();
// const { server } = require('./app');
// const connectDB = require('./src/Config/db');
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');

// console.log('🚀 Starting server setup...');

// // Connect to DB
// connectDB();

// // Start server
// server.listen(config.port, () => {
//   console.log(`✅ Server running on port ${config.port} in ${config.environment} mode`);
//   logger.info(`✅ Server running on port ${config.port} in ${config.environment} mode`);
// });

// // Graceful shutdown handlers
// process.on('unhandledRejection', (err) => {
//   logger.error('❌ Unhandled Rejection:', err);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', (err) => {
//   logger.error('❌ Uncaught Exception:', err);
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('📝 SIGTERM received. Shutting down gracefully');
//   server.close(() => process.exit(0));
// });

// process.on('SIGINT', () => {
//   logger.info('📝 SIGINT received. Shutting down');
//   server.close(() => process.exit(0));
// });


console.log('🟢 Starting index.js...');
require('dotenv').config();

console.log('✅ Loaded environment variables:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? '✅ Present' : '❌ Missing',
  NODE_ENV: process.env.NODE_ENV
});

const { server } = require('./app');
console.log('✅ App imported successfully');

const connectDB = require('./src/Config/db');
console.log('✅ DB Config imported');

const config = require('./src/Config/env');
console.log('✅ Env Config imported:', config);

connectDB();
console.log('🔗 Attempting to connect DB...');

