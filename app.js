


// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const helmet = require('helmet');
// // const rateLimit = require('express-rate-limit');

// const BettingHistoryJob = require('./src/corn/BettingHistoryJob');
// const updateVipPoints = require('./src/corn/updateVipPoints');
// const rewardProcessor = require('./src/Services/rewardProcessor');
// const bettingHistoryService = require('./src/Services/bettingHistoryService');
// // const chatSocketHandler = require('./src/Healper/chatSocketHandler');
// const TurnOverJob = require('./src/corn/TurnOverJob');
// const weeklyLossBonusCrons = require('./src/corn/weeklyLossBonusCron');
// const calculateDailyRebates = require('./src/corn/calculateDailyRebates');
// const TurnOverUpdateBettingHistoryJobs = require('./src/corn/TurnOverUpdateBettingHistoryJobs');
// const mongoSanitize = require('express-mongo-sanitize');
// const cookieParser = require('cookie-parser');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const request = require('request');
// const router = require('./src/Router/Api');
// const cookieHandler = require('./src/MiddleWare/cookieMiddleware');
// const logger = require('./src/utils/logger');
// const subAdminAurth = require('./src/Router/subAdminAurth');
// const transactionRoutes = require('./src/Router/transactionRoutes');
// const subAdminRoutes = require('./src/Router/subAdminRoutes');
// const dashboardRoutes = require('./src/Router/dashboardRoutes');
// const userRoutes = require('./src/Router/userRoutes');
// const gameRoutes = require('./src/Router/gameRoutes');
// const mainAdminRoutes = require('./src/Router/mainAdminRoutes');
// const app = express();





// const socketIO = require('./socket/gameSocket');



// // Create HTTP server
// const server = http.createServer(app);

// // Initialize Socket.io
// const io = socketIO.initializeSocket(server);

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));








// app.use(morgan('combined', { stream: logger.stream }));
// app.use(helmet());
// // app.use(cors({ origin: '*', credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(cookieHandler);
// app.use(mongoSanitize());
// // app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
// app.use(cors({
//   origin: ['http://localhost:3000','http://localhost:3001'], // allow your frontend URL
//   credentials: true // enable cookies, authorization headers, etc.
// }));

// // Required if you're using express-rate-limit or have proxy in front
// app.set('trust proxy', 1); 

// // app.use(cors({
// //     origin: 'http://localhost:3000',
// //     credentials: true,
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// // }));
// // Proxy setup
// app.use('/apiWallet', createProxyMiddleware({
//   target: 'https://www.fwick7ets.xyz',
//   changeOrigin: true,
//   pathRewrite: { '^/apiWallet': '/apiWallet' },
//   secure: false,
//   cookieDomainRewrite: { "www.fwick7ets.xyz": "localhost" },
//   // onProxyRes: (proxyRes) => {
//   //   delete proxyRes.headers['access-control-allow-origin'];
//   //   delete proxyRes.headers['Access-Control-Allow-Origin'];
//   // }
// }));

// app.use("/proxy", (req, res) => {
//   const targetUrl = req.query.url;
//   req.pipe(request(targetUrl)).pipe(res);
// });

// // Routes
// app.use("/api/v1", router);
// app.use('/api/auth', subAdminAurth);
// // In your main server file (app.js or index.js)

// app.use('/api/transactions', transactionRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/subadmin', subAdminRoutes);
// app.use('/api/Admin', mainAdminRoutes);
// app.use('/api/games', gameRoutes);




// app.get('/health', (req, res) => {
//   const health = {
//     status: 'OK',
//     timestamp: new Date(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     socket: {
//       connectedClients: socketIO.getConnectedClientsCount(),
//       rooms: socketIO.getRoomsInfo()
//     }
//   };
//   res.json(health);
// });

// app.get('/', (req, res) => {
//   res.json({ message: "API is working!" });
// });

// app.get('/api/v2', (req, res) => {
//   res.json({ message: "API v2 is running!" });
// });

// app.use("*", (req, res) => {
//   res.status(404).json({ status: "Fail", data: "Data not found" });
// });

// app.use((err, req, res, next) => {
//   logger.error('[Global Error]', err);
//   res.status(500).json({ errCode: 500, errMsg: 'Internal server error' });
// });

// module.exports = app;
// server.js or your main server file
// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const cookieParser = require('cookie-parser');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const request = require('request');
// const http = require('http');
// const path = require('path');

// // Import routes
// const router = require('./src/Router/Api');
// const cookieHandler = require('./src/MiddleWare/cookieMiddleware');
// const logger = require('./src/utils/logger');
// const subAdminAurth = require('./src/Router/subAdminAurth');
// const transactionRoutes = require('./src/Router/transactionRoutes');
// const subAdminRoutes = require('./src/Router/subAdminRoutes');
// const dashboardRoutes = require('./src/Router/dashboardRoutes');
// const userRoutes = require('./src/Router/userRoutes');
// const gameRoutes = require('./src/Router/gameRoutes');
// const mainAdminRoutes = require('./src/Router/mainAdminRoutes');

// // Import Live Chat Routes
// // const liveChatRoutes = require('./src/Router/chatRoutes');

// // Import cron jobs
const BettingHistoryJob = require('./src/corn/BettingHistoryJob');
const updateVipPoints = require('./src/corn/updateVipPoints');
const rewardProcessor = require('./src/Services/rewardProcessor');
const bettingHistoryService = require('./src/Services/bettingHistoryService');
const TurnOverJob = require('./src/corn/TurnOverJob');
const weeklyLossBonusCrons = require('./src/corn/weeklyLossBonusCron');
const calculateDailyRebates = require('./src/corn/calculateDailyRebates');
const TurnOverUpdateBettingHistoryJobs = require('./src/corn/TurnOverUpdateBettingHistoryJobs');

// // Import socket configurations
// // const gameSocketIO = require('./src/socket/gameSocket');
// // const liveChatSocket = require('./src/socket/liveChatSocket');

// const app = express();

// // // Create HTTP server
// const server = http.createServer(app);

// // Initialize Sockets
// // const gameIO = gameSocketIO.initializeSocket(server);
// // const liveChatIO = liveChatSocket.initializeSocket(server);

// // Store socket instances in app for route access
// // app.set('gameSocket', gameIO);
// // app.set('liveChatSocket', liveChatIO);

// // Middleware
// app.use(morgan('combined', { stream: logger.stream }));
// app.use(helmet());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// app.use(cookieParser());
// app.use(cookieHandler);
// app.use(mongoSanitize());

// // CORS configuration
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
// }));

// // Required if you're using express-rate-limit or have proxy in front
// app.set('trust proxy', 1);

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Proxy setup
// app.use('/apiWallet', createProxyMiddleware({
//   target: 'https://www.fwick7ets.xyz',
//   changeOrigin: true,
//   pathRewrite: { '^/apiWallet': '/apiWallet' },
//   secure: false,
//   cookieDomainRewrite: { "www.fwick7ets.xyz": "localhost" },
// }));

// app.use("/proxy", (req, res) => {
//   const targetUrl = req.query.url;
//   req.pipe(request(targetUrl)).pipe(res);
// });

// // Routes
// app.use("/api/v1", router);
// app.use('/api/auth', subAdminAurth);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/subadmin', subAdminRoutes);
// app.use('/api/Admin', mainAdminRoutes);
// app.use('/api/games', gameRoutes);

// // Live Chat Routes
// // app.use('/api/live-chat', liveChatRoutes);

// // Health check endpoint with socket status
// app.get('/health', (req, res) => {
//   const health = {
//     status: 'OK',
//     timestamp: new Date(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     sockets: {
//       game: {
//         connectedClients: gameSocketIO.getConnectedClientsCount(),
//         rooms: gameSocketIO.getRoomsInfo()
//       },
//       liveChat: {
//         connectedClients: liveChatSocket.getConnectedClientsCount(),
//         rooms: liveChatSocket.getRoomsInfo()
//       }
//     }
//   };
//   res.json(health);
// });

// app.get('/', (req, res) => {
//   res.json({ 
//     message: "API is working!",
//     sockets: {
//       game: "Game Socket.io is integrated",
//       liveChat: "Live Chat Socket.io is integrated"
//     },
//     endpoints: {
//       health: '/health',
//       games: '/api/games',
//       liveChat: '/api/live-chat'
//     }
//   });
// });

// app.get('/api/v2', (req, res) => {
//   res.json({ message: "API v2 is running!" });
// });

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({ status: "Fail", data: "Data not found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   logger.error('[Global Error]', err);
//   res.status(500).json({ errCode: 500, errMsg: 'Internal server error' });
// });

// module.exports = { app, server };


// app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Import routes
const router = require('./src/Router/Api');
const cookieHandler = require('./src/MiddleWare/cookieMiddleware');
const logger = require('./src/utils/logger');
const subAdminAurth = require('./src/Router/subAdminAurth');
const transactionRoutes = require('./src/Router/transactionRoutes');
const subAdminRoutes = require('./src/Router/subAdminRoutes');
const dashboardRoutes = require('./src/Router/dashboardRoutes');
const userRoutes = require('./src/Router/userRoutes');
const gameRoutes = require('./src/Router/gameRoutes');
const mainAdminRoutes = require('./src/Router/mainAdminRoutes');
const phoneVerificationRoute = require('./src/Router/phoneVerificationRoute');

// Import Live Chat Routes
const chatRoutes = require('./src/Router/chatRoutes');

// Import Socket Server
const { initializeSocket, getConnectionStats, getUserConnections, getRoomInfo } = require('./src/socket/socketServer');

const app = express();

console.log('🚀 Starting application initialization...');

// Create HTTP server
const server = http.createServer(app);
console.log('✅ HTTP server created');

// Initialize Socket.io
console.log('🔌 Initializing Socket.io...');
const io = initializeSocket(server);

// Store socket instance in app for route access
app.set('io', io);
console.log('✅ Socket.io stored in app context');

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'socket-id']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cookieHandler);
app.use(mongoSanitize());

// Required if you're using express-rate-limit or have proxy in front
app.set('trust proxy', 1);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/v1", router);
app.use('/api/auth', subAdminAurth);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subadmin', subAdminRoutes);
app.use('/api/Admin', mainAdminRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/phone', phoneVerificationRoute);

// Live Chat Routes
app.use('/api/live-chat', chatRoutes);

// Socket monitoring routes

// Socket monitoring routes
app.get('/api/socket/health', (req, res) => {
  const stats = getConnectionStats();
  res.json({
    status: 'OK',
    socketEnabled: true,
    ...stats
  });
});

app.get('/api/socket/user/:userId', (req, res) => {
  const { userId } = req.params;
  const connections = getUserConnections(userId);
  res.json({
    userId,
    connections,
    totalConnections: connections.length
  });
});

app.get('/api/socket/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const roomInfo = getRoomInfo(roomId);
  if (roomInfo) {
    res.json(roomInfo);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.post('/api/socket/broadcast/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { event, message, data } = req.body;
  
  if (!event || !message) {
    return res.status(400).json({ error: 'Event and message are required' });
  }

  const success = require('./src/socket/socketServer').sendToRoom(roomId, event, { 
    message, 
    ...data,
    broadcastAt: new Date().toISOString()
  });
  
  if (success) {
    res.json({ 
      success: true, 
      message: `Event ${event} sent to room ${roomId}`,
      roomId,
      event 
    });
  } else {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    socket: {
      enabled: true,
      ...getConnectionStats()
    }
  };
  
  console.log('🏥 Health check requested:', health);
  res.json(health);
});

app.get('/health/detailed', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    socket: {
      enabled: true,
      ...getConnectionStats()
    },
    routes: [
      '/health',
      '/health/detailed',
      '/api/socket/health',
      '/api/socket/user/:userId',
      '/api/socket/room/:roomId',
      '/api/socket/broadcast/:roomId'
    ]
  };
  
  res.json(health);
});

app.get('/', (req, res) => {
  res.json({ 
    message: "API is working!",
    version: "1.0.0",
    socket: "Socket.io is integrated and running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      healthDetailed: '/health/detailed',
      socketHealth: '/api/socket/health',
      socketUser: '/api/socket/user/:userId',
      socketRoom: '/api/socket/room/:roomId',
      games: '/api/games',
      liveChat: '/api/live-chat',
      admin: '/api/Admin'
    }
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    status: "Fail", 
    message: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  logger.error('[Global Error]', err);
  res.status(500).json({ 
    errCode: 500, 
    errMsg: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Express app setup completed');

module.exports = { app, server };