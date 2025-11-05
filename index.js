// // index.js
// require('dotenv').config();
// const { server } = require('./app');
// const connectDB = require('./src/Config/db');
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');

// // Connect DB
// connectDB();

// // Start server
// const PORT = process.env.PORT || config.port || 5000;
// const HOST = '0.0.0.0'; // ✅ Render/Heroku এর জন্য প্রয়োজন হলে host আলাদা করে রাখো

// server.listen(PORT, HOST, () => {
//   console.log(`✅ Server running on http://${HOST}:${PORT} (${config.environment} mode)`);
//   logger.info(`✅ Server running on http://${HOST}:${PORT} (${config.environment} mode)`);
// });


// // Graceful shutdown
// process.on('unhandledRejection', (err) => {
//   logger.error('❌ Unhandled Rejection:', err);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', (err) => {
//   logger.error('❌ Uncaught Exception:', err);
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('📝 SIGTERM received. Shutting down gracefully...');
//   server.close(() => process.exit(0));
// });

// process.on('SIGINT', () => {
//   logger.info('📝 SIGINT received. Server closing...');
//   server.close(() => process.exit(0));
// });
require('dotenv').config();
const { server } = require('./app');
const connectDB = require('./src/Config/db');
const config = require('./src/Config/env');
const logger = require('./src/utils/logger');

// Debug info
console.log('🚀 Starting server...');
console.log('Node version:', process.version);

// Connect MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || config.port || 5000;
const HOST = '0.0.0.0'; // Railway requirement
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT} (${process.env.NODE_ENV || config.environment} mode)`);
  logger.info(`✅ Server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`📝 ${signal} received. Closing server...`);
  logger.info(`📝 ${signal} received. Closing server...`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => { logger.error('❌ Unhandled Rejection:', err); server.close(() => process.exit(1)); });
process.on('uncaughtException', (err) => { logger.error('❌ Uncaught Exception:', err); server.close(() => process.exit(1)); });
