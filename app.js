

// // app.js
// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const cookieParser = require('cookie-parser');
// const http = require('http');
// const path = require('path');
// require('dotenv').config();

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
// const phoneVerificationRoute = require('./src/Router/phoneVerificationRoute');
// // const emailVerificationService = require('./src/Router/emailVerificationRoutes');
// const turnoverRoutes = require('./src/Router/turnoverServicesRoutes');
// const promotionsServiceRoutes = require('./src/Router/promotionsServiceRoutes');

// // Import Live Chat Routes
// const chatRoutes = require('./src/Router/chatRoutes');

// // Import Socket Server
// const { initializeSocket, getConnectionStats, getUserConnections, getRoomInfo } = require('./src/socket/socketServer');

// const app = express();

// console.log('🚀 Starting application initialization...');

// // Create HTTP server
// const server = http.createServer(app);
// console.log('✅ HTTP server created');

// // Initialize Socket.io
// console.log('🔌 Initializing Socket.io...');
// const io = initializeSocket(server);

// // Store socket instance in app for route access
// app.set('io', io);
// console.log('✅ Socket.io stored in app context');

// // Enhanced CORS configuration
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'socket-id']
// }));

// // Handle preflight requests
// app.options('*', cors());

// // Middleware
// app.use(morgan('combined', { stream: logger.stream }));
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// app.use(cookieParser());
// app.use(cookieHandler);
// app.use(mongoSanitize());

// // Required if you're using express-rate-limit or have proxy in front
// app.set('trust proxy', 1);

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use("/api/v1", router);
// app.use('/api/auth', subAdminAurth);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/subadmin', subAdminRoutes);
// app.use('/api/Admin', mainAdminRoutes);
// app.use('/api/games', gameRoutes);
// app.use('/api/phone', phoneVerificationRoute);
// // app.use('/api/email', emailVerificationService);
// app.use('/api/turnover', turnoverRoutes);
// app.use('/api/promotions', promotionsServiceRoutes);

// // Live Chat Routes
// app.use('/api/live-chat', chatRoutes);

// // Socket monitoring routes

// // Socket monitoring routes
// app.get('/api/socket/health', (req, res) => {
//   const stats = getConnectionStats();
//   res.json({
//     status: 'OK',
//     socketEnabled: true,
//     ...stats
//   });
// });

// app.get('/api/socket/user/:userId', (req, res) => {
//   const { userId } = req.params;
//   const connections = getUserConnections(userId);
//   res.json({
//     userId,
//     connections,
//     totalConnections: connections.length
//   });
// });

// app.get('/api/socket/room/:roomId', (req, res) => {
//   const { roomId } = req.params;
//   const roomInfo = getRoomInfo(roomId);
//   if (roomInfo) {
//     res.json(roomInfo);
//   } else {
//     res.status(404).json({ error: 'Room not found' });
//   }
// });

// app.post('/api/socket/broadcast/:roomId', (req, res) => {
//   const { roomId } = req.params;
//   const { event, message, data } = req.body;
  
//   if (!event || !message) {
//     return res.status(400).json({ error: 'Event and message are required' });
//   }

//   const success = require('./src/socket/socketServer').sendToRoom(roomId, event, { 
//     message, 
//     ...data,
//     broadcastAt: new Date().toISOString()
//   });
  
//   if (success) {
//     res.json({ 
//       success: true, 
//       message: `Event ${event} sent to room ${roomId}`,
//       roomId,
//       event 
//     });
//   } else {
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// });

// // Enhanced health check endpoint
// app.get('/health', (req, res) => {
//   const health = {
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     environment: process.env.NODE_ENV || 'development',
//     socket: {
//       enabled: true,
//       ...getConnectionStats()
//     }
//   };
  
//   console.log('🏥 Health check requested:', health);
//   res.json(health);
// });

// app.get('/health/detailed', (req, res) => {
//   const health = {
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     environment: process.env.NODE_ENV || 'development',
//     nodeVersion: process.version,
//     platform: process.platform,
//     socket: {
//       enabled: true,
//       ...getConnectionStats()
//     },
//     routes: [
//       '/health',
//       '/health/detailed',
//       '/api/socket/health',
//       '/api/socket/user/:userId',
//       '/api/socket/room/:roomId',
//       '/api/socket/broadcast/:roomId'
//     ]
//   };
  
//   res.json(health);
// });

// app.get('/', (req, res) => {
//   res.json({ 
//     message: "API is working!",
//     version: "1.0.0",
//     socket: "Socket.io is integrated and running",
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       health: '/health',
//       healthDetailed: '/health/detailed',
//       socketHealth: '/api/socket/health',
//       socketUser: '/api/socket/user/:userId',
//       socketRoom: '/api/socket/room/:roomId',
//       games: '/api/games',
//       liveChat: '/api/live-chat',
//       admin: '/api/Admin'
//     }
//   });
// });

// // 404 handler
// app.use("*", (req, res) => {
//   console.log('❌ 404 - Route not found:', req.originalUrl);
//   res.status(404).json({ 
//     status: "Fail", 
//     message: "Route not found",
//     path: req.originalUrl,
//     timestamp: new Date().toISOString()
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('❌ Global error handler:', {
//     error: err.message,
//     stack: err.stack,
//     url: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });
  
//   logger.error('[Global Error]', err);
//   res.status(500).json({ 
//     errCode: 500, 
//     errMsg: 'Internal server error',
//     timestamp: new Date().toISOString()
//   });
// });

// console.log('✅ Express app setup completed');

// module.exports = { app, server };
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Routes
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
const turnoverRoutes = require('./src/Router/turnoverServicesRoutes');
const promotionsServiceRoutes = require('./src/Router/promotionsServiceRoutes');
const chatRoutes = require('./src/Router/chatRoutes');

// Socket
const { initializeSocket, getConnectionStats, getUserConnections, getRoomInfo } = require('./src/socket/socketServer');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Add your frontend domain
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cookieHandler);
app.use(mongoSanitize());
app.set('trust proxy', 1);

// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/v1", router);
app.use('/api/auth', subAdminAurth);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subadmin', subAdminRoutes);
app.use('/api/Admin', mainAdminRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/phone', phoneVerificationRoute);
app.use('/api/turnover', turnoverRoutes);
app.use('/api/promotions', promotionsServiceRoutes);
app.use('/api/live-chat', chatRoutes);

// Socket monitoring endpoints
app.get('/api/socket/health', (req, res) => res.json({ status: 'OK', ...getConnectionStats() }));
app.get('/api/socket/user/:userId', (req, res) => res.json({ userId: req.params.userId, connections: getUserConnections(req.params.userId) }));
app.get('/api/socket/room/:roomId', (req, res) => {
  const roomInfo = getRoomInfo(req.params.roomId);
  if (!roomInfo) return res.status(404).json({ error: 'Room not found' });
  res.json(roomInfo);
});

// Default route
app.get('/', (req, res) => res.json({ message: "API is working 🚀" }));

// 404 handler
app.use("*", (req, res) => res.status(404).json({ message: "Route not found", path: req.originalUrl }));

// Global error
app.use((err, req, res, next) => {
  logger.error('[Global Error]', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = { app, server };
