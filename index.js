
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

require('dotenv').config();
const app = require('./app');
const config = require('./src/Config/env');
const logger = require('./src/utils/logger');
const connectDB = require('./src/Config/db');

// Connect to DB
connectDB();

// Start server
 const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.environment} mode on port ${config.port}`);
});

console.log('Server is running');
// Graceful shutdown & error handling
process.on('unhandledRejection', err => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  logger.error(`Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.stack || err);
});


