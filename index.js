// index.js
require('dotenv').config();
const { server } = require('./app');
const connectDB = require('./src/Config/db');
const config = require('./src/Config/env');
const logger = require('./src/utils/logger');

// Connect DB
connectDB();

// Start server
const PORT = process.env.PORT || config.port || 5000;
const HOST = '0.0.0.0'; // ✅ Render/Heroku এর জন্য প্রয়োজন হলে host আলাদা করে রাখো

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT} (${config.environment} mode)`);
  logger.info(`✅ Server running on http://${HOST}:${PORT} (${config.environment} mode)`);
});


// Graceful shutdown
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('📝 SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('📝 SIGINT received. Server closing...');
  server.close(() => process.exit(0));
});
