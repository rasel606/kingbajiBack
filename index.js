
 // Import the main application

// const app = require('./app');

// const PORT = process.env.PORT || 5000;
// const { Server } = require("socket.io");
// const http = require("http");
// const socketAuth = require('./src/MiddleWare/socketAuth');
// const chatSocket = require('./src/Services/chatSocket');
// const chatSocketHandler = require('./src/Healper/chatSocketHandler');

// const server = http.createServer(app);

// app.listen(PORT , () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { 
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });

// // Socket.IO authentication middleware
// io.use(socketAuth);

// // Initialize chat socket handlers
// chatSocket(io);


//   server.listen(process.env.PORT || 5000, () => {
//     console.log("Server running");
//   });






// app.listen(PORT , () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const app = require('./app');

// // try {
  

//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//   });
// } catch (err) {
  // if (err.code === 'MODULE_NOT_FOUND') {
  //   console.error('❌ Missing module:', err.message);
  // } else {
  //   console.error('❌ Startup error:', err);
  // }
  // process.exit(1); // Exit gracefully

//   console.error('❌ Startup error:', err);
//   // process.exit(1);
// }require('dotenv').config();









//---------------------------------------------------------------------------------//

// require('dotenv').config();
// const app = require('./app');
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');
// const connectDB = require('./src/Config/db');

// // Connect to DB
// connectDB();

// // Start server
//  const server = app.listen(config.port, () => {
//   logger.info(`Server running in ${config.environment} mode on port ${config.port}`);
// });

// console.log('Server is running');
// // Graceful shutdown & error handling
// process.on('unhandledRejection', err => {
//   logger.error(`Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', err => {
//   logger.error(`Uncaught Exception: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('SIGTERM received. Shutting down gracefully');
//   server.close(() => {
//     logger.info('Process terminated');
//   });
// });

// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err.stack || err);
// });

// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Rejection:', err.stack || err);
// });


// // app.js or index.js (your main entry point)
// require('dotenv').config();
// const { server } = require('./server'); // Updated import
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');
// const connectDB = require('./src/Config/db');

// // Connect to DB
// connectDB();

// // Import socket to ensure it's initialized
// const socketIO = require('./socket/gameSocket');

// // Start server
// server.listen(config.port, () => {
//   logger.info(`🚀 Server running in ${config.environment} mode on port ${config.port}`);
//   logger.info(`🔌 Socket.io is ready for real-time connections`);
//   logger.info(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001`);
// });

// console.log('✅ Server is running with Socket.io support');

// // Graceful shutdown & error handling
// process.on('unhandledRejection', err => {
//   logger.error(`❌ Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', err => {
//   logger.error(`❌ Uncaught Exception: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('📝 SIGTERM received. Shutting down gracefully');
//   server.close(() => {
//     logger.info('✅ Process terminated');
//   });
// });

// // Socket.io specific cleanup
// process.on('exit', () => {
//   logger.info('🔌 Closing Socket.io connections');
// });


// // app.js or index.js (your main entry point)
// require('dotenv').config();
// const { server } = require('./app'); // Updated import
// const config = require('./src/Config/env');
// const logger = require('./src/utils/logger');
// const connectDB = require('./src/Config/db');

// // Connect to DB
// connectDB();

// // Import socket to ensure it's initialized
// const socketIO = require('./src/socket/gameSocket');

// // Start server
// server.listen(config.port, () => {
//   logger.info(`🚀 Server running in ${config.environment} mode on port ${config.port}`);
//   logger.info(`🔌 Socket.io is ready for real-time connections`);
//   logger.info(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001`);
// });

// console.log('✅ Server is running with Socket.io support');

// // Graceful shutdown & error handling
// process.on('unhandledRejection', err => {
//   logger.error(`❌ Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('uncaughtException', err => {
//   logger.error(`❌ Uncaught Exception: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// process.on('SIGTERM', () => {
//   logger.info('📝 SIGTERM received. Shutting down gracefully');
//   server.close(() => {
//     logger.info('✅ Process terminated');
//   });
// });

// // Socket.io specific cleanup
// process.on('exit', () => {
//   logger.info('🔌 Closing Socket.io connections');
// });
// app.js or index.js (your main entry point)// server.js
require('dotenv').config();
const { server } = require('./app');
const config = require('./src/Config/env');
const logger = require('./src/utils/logger');
// const connectDB = require('./src/Config/db');

console.log('🚀 Starting server...', {
  environment: config.environment,
  port: config.port,
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

// Connect to DB
console.log('🔗 Connecting to database...');
// connectDB();
const port = process.env.PORT || 5000;
const host = '0.0.0.0';
// Start server
server.listen(port, host, () => {
  console.log('🎉 Server started successfully:', {
    port,
    environment: config.environment,
    timestamp: new Date().toISOString()
  });
  logger.info(`🚀 Server running in ${port} mode on port ${port}`);
  logger.info(`🔌 Socket.io is ready for real-time connections`);
  logger.info(`💬 Live Chat System is initialized`);
  logger.info(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001`);
  logger.info(`📊 Socket monitoring available at /api/socket/health`);
});

// Graceful shutdown & error handling
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  logger.error(`❌ Unhandled Rejection: ${err.message}`, err);
  server.close(() => {
    console.log('🔒 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  logger.error(`❌ Uncaught Exception: ${err.message}`, err);
  server.close(() => {
    console.log('🔒 Server closed due to uncaught exception');
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('📝 SIGTERM received. Shutting down gracefully...', {
    timestamp: new Date().toISOString()
  });
  
  logger.info('📝 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated gracefully');
    logger.info('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📝 SIGINT received. Shutting down...', {
    timestamp: new Date().toISOString()
  });
  
  logger.info('📝 SIGINT received. Shutting down');
  server.close(() => {
    console.log('✅ Process terminated by user');
    logger.info('✅ Process terminated by user');
    process.exit(0);
  });
});

// Socket.io specific cleanup
process.on('exit', (code) => {
  console.log('🔌 Process exiting with code:', {
    code,
    timestamp: new Date().toISOString()
  });
  logger.info(`🔌 Process exiting with code: ${code}`);
});

console.log('✅ Server startup configuration completed');