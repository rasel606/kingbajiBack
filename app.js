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
const turnoverRoutes = require('./src/Router/turnoverServicesRoutes');
const promotionsServiceRoutes = require('./src/Router/promotionsServiceRoutes');
const userProfileRoutes = require('./src/Router/userProfileRoutes');
const paymentMethod = require('./src/Router/paymentMethod');
const hierarchicalGatewayRoutes = require('./src/Router/hierarchicalGatewayRoutes');

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

connectDB();

// Logging middleware
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
}));

// Serve uploaded files
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
app.use('/api/profile', userProfileRoutes);
app.use('/api/payment-methods', paymentMethod);
app.use('/api/payment', hierarchicalGatewayRoutes);

// Live Chat Routes
app.use('/api/live-chat', chatRoutes);

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
  
  logger.error('Global Error Handler', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Express app setup completed');

module.exports = { app, server };