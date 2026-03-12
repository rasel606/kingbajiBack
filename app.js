

// app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
require('dotenv').config();

const IS_TEST = process.env.NODE_ENV === 'test';

// Import routes

const cookieHandler = require('./src/middleWare/cookieHandler');
const logger = require('./src/utils/logger');
const apiRouter = require('./src/router/apiRouter');
const adminAuthRouter = require('./src/router/adminAuth'); 
const transactionRoutes = require('./src/router/transactionRoutes');
const subAdminRoutes = require('./src/router/subAdminRoutes');
const dashboardRoutes = require('./src/router/dashboardRoutes');
const userRoutes = require('./src/router/userRoutes');
const gameRoutes = require('./src/router/gameRoutes');
const mainAdminRoutes = require('./src/router/mainAdminRoutes');
const phoneVerificationRoute = require('./src/router/phoneVerificationRoute');
const turnoverRoutes = require('./src/router/turnoverServicesRoutes');
const promotionsServiceRoutes = require('./src/router/promotionsServiceRoutes');
const userProfileRoutes = require('./src/router/userProfileRoutes');
const paymentMethod = require('./src/router/paymentMethod');
const hierarchicalGatewayRoutes = require('./src/router/hierarchicalGatewayRoutes');
const affiliateEarningsRoutes = require('./src/router/affiliateEarnings');        
const notificationRoutes = require('./src/router/notificationRoutes');        
const reportRoutes = require('./src/router/reportRoutes');        

const kycRoutes = require('./src/router/kyc');
// const links = require('./src/router/links');
const affiliateLinkRoutes = require('./src/router/links');
const withdrawalRoutes = require('./src/router/withdrawals');
const profileRoutes = require('./src/router/affiliateProfile');
const agentRoutes = require('./src/router/agentRoutes');
const agentDashboard = require('./src/router/agentDashboard');
const subAdminDashboard = require('./src/router/subAdminDashboard');
const subAgentRoutes = require('./src/router/subAgentRoutes');
const affiliateDashboardRoute = require('./src/router/affiliateDashboardRoute');
const affiliateAuthRoute = require('./src/router/affiliateAuthRoute');
const announcementRoutes = require('./src/router/announcementRoutes');
const bettingRoutes = require('./src/router/bettingRoutes');
const vipUserRoutes = require('./src/router/vipUserRoutes');
const realTimeBonusRoute = require('./src/router/realTimeBonusRoute');
let BettingHistoryJob, SpcialBettingHistoryJob, referralBonusProcessor;
if (!IS_TEST) {
  BettingHistoryJob = require('./src/corn/BettingHistoryJob');
  SpcialBettingHistoryJob = require('./src/corn/SpcialBettingHistoryJob');
  referralBonusProcessor = require('./src/corn/referralBonusProcessor');
}
const referralRoutes = require('./src/router/referralRoutes');
const legalRoutes = require('./src/router/legalRoutes');
const widgetRoutes = require('./src/router/widgetRoutes');
const widgetPublicRoutes = require('./src/router/widgetPublicRoutes');
// Import Live Chat Routes
// const chatRoutes = require('./src/router/chatRoutes'); // ⚠️ Disabled: ChatController is commented out

// Import new routes
const socialLinksRoutes = require('./src/router/socialLinksRoutes');
const affiliateManagementRoutes = require('./src/router/affiliateManagementRoutes');
const profileAuthRoutes = require('./src/router/profileAuthRoutes');
const advancedDashboardRoutes = require('./src/router/advancedDashboardRoutes');
const unifiedDashboardRoutes = require('./src/router/unifiedDashboardRoutes');
const AdminAuth = require('./src/middleWare/AdminAuth');
const AdminController = require('./src/controllers/AdminController');

// Import Socket Server
const { initializeSocket, getConnectionStats, getUserConnections, getRoomInfo } = require('./src/socket/socketServer');

const app = express();

console.log('🚀 Starting application initialization...');

// Create HTTP server
const server = http.createServer(app);
console.log('✅ HTTP server created');

// Initialize Socket.io (skip in test to avoid open handles)
if (!IS_TEST) {
  console.log('🔌 Initializing Socket.io...');
  const io = initializeSocket(server);
app.set('socketio', io);
  app.set('io', io);
  console.log('✅ Socket.io stored as socketio & io in app context');

  // Make io accessible in routes via req.io
  app.use((req, res, next) => {
    req.io = io;
    next();
  });
}

app.use(cors({
  origin: "*", // সব domain allow করুন
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// OPTIONS request handle করুন
app.options('*', cors());

// Handle preflight requests
app.options('*', cors());

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // You can configure this based on your needs
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Additional middleware
app.use(cookieParser());
app.use(cookieHandler);
app.use(mongoSanitize());

// Trust proxy for rate limiting behind proxies
app.set('trust proxy', 1);

// MongoDB Connection
const connectDB = async () => {
  // try {
  //   await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/bajicrick247?retryWrites=true&w=majority&appName=Cluster0", {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   });
  //   console.log('✅ MongoDB Connected Successfully');
  // } catch (error) {
  //   console.error('❌ MongoDB Connection Failed:', error);
  //   process.exit(1);
  // }

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
};

if (!IS_TEST) {
  connectDB();
}

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/v1", apiRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', mainAdminRoutes);
app.use('/api/adminannouncement', announcementRoutes);

// Admin Dashboard (explicit route to keep legacy frontend path working)
app.get('/api/admin/dashboard/overview', AdminAuth, AdminController.getAdminDashboardStats);




////////////////SubAdmin////////////////////////////////
app.use('/api/subadmin/dashboard', subAdminDashboard);
app.use('/api/subadmin', subAdminRoutes);
////////////////agent////////////////////////////////
app.use('/api/agent', agentRoutes);
app.use('/api/agent_dashboard', agentDashboard);
app.use('/api/sub_agent', subAgentRoutes);

app.use('/api/transactions', transactionRoutes);
app.use('/api/admin/dashboard', AdminAuth, dashboardRoutes);
app.use('/api/dashboard/analytics', advancedDashboardRoutes);
app.use('/api/unified-dashboard', unifiedDashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/notification', notificationRoutes);
app.use('/api/user/rebet', reportRoutes);
app.use('/api/user/betting', bettingRoutes);
app.use('/api/user/vip', vipUserRoutes);
app.use('/api/user/rebate', realTimeBonusRoute);
app.use('/api/transactions', require('./src/router/transactionRoutes'));
app.use('/api/payment-methods', paymentMethod);

app.use('/api/games', gameRoutes);
app.use('/api/phone', phoneVerificationRoute);
app.use('/api/turnover', turnoverRoutes);
app.use('/api/promotions', promotionsServiceRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/referral', referralRoutes);





app.use('/api/payment', hierarchicalGatewayRoutes);
app.use('/api/affiliate/Auth', affiliateAuthRoute);
app.use('/api/affiliate/dashboard', affiliateDashboardRoute);
app.use('/api/affiliate/profile', profileRoutes);
app.use('/api/affiliate/earnings', affiliateEarningsRoutes);
app.use('/api/affiliate/links', affiliateLinkRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/admin/banners', require('./src/router/adminBannerRoutes'));
app.use('/api/admin/ads', require('./src/router/adminAdRoutes'));
app.use('/api/ads', require('./src/router/publicAdRoutes'));
app.use('/api/admin/widgets', widgetRoutes);
app.use('/api/widgets', widgetPublicRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
// Live Chat Routes
// app.use('/api/live-chat', chatRoutes); // ⚠️ Disabled: ChatController is commented out

// =============================================
// NEW MANAGEMENT ROUTES
// =============================================
// Social Links Management
app.use('/api/social-links', socialLinksRoutes);

// Affiliate Management Routes
app.use('/api/admin/affiliate/management', affiliateManagementRoutes);

// Profile & Auth Routes
app.use('/api/auth', profileAuthRoutes);

// Socket monitoring routes
app.get('/api/socket/health', (req, res) => {
  const stats = getConnectionStats();
  res.json({
    status: 'OK',
    socketEnabled: true,
    ...stats,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/socket/user/:userId', (req, res) => {
  const { userId } = req.params;
  const connections = getUserConnections(userId);
  res.json({
    userId,
    connections,
    totalConnections: connections.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/socket/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const roomInfo = getRoomInfo(roomId);
  if (roomInfo) {
    res.json(roomInfo);
  } else {
    res.status(404).json({
      error: 'Room not found',
      roomId,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoints
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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routes: [
      '/health',
      '/health/detailed',
      '/api/socket/health',
      '/api/socket/user/:userId',
      '/api/socket/room/:roomId'
    ]
  };

  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "BajiCrick API Server is running!",
    version: "1.0.0",
    socket: "Socket.io is integrated and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
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

// Demo lobby page built from provided layout sample
app.get('/table-lobby', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'static', 'table-lobby.html'));
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "Fail",
    message: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the full error for debugging
  logger.error('Global Error Handler', {
    error: err.message,
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    isOperational: err.isOperational
  });

  // Send a clean, operational error message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // For programming or other unknown errors, don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'Something went very wrong!'
    : err.message;

  return res.status(500).json({
    status: 'error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Express app setup completed');

module.exports = { app, server };
