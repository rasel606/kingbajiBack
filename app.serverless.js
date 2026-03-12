// app.serverless.js - Serverless-compatible version for Vercel
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const cookieHandler = require('./src/middleWare/cookieHandler');
const logger = require('./src/utils/logger');
const apiRouter = require('./src/router/apiRouter');
const refactoredApiRouter = require('./src/router/refactoredApiRouter');
const adminAurth = require('./src/router/adminAurth');
const transactionRoutes = require('./src/router/transactionRoutes');
const subAdminRoutes = require('./src/router/subAdminRoutes');
const subAdminAurth = require('./src/router/subAdminAurth');
const dashboardRoutes = require('./src/router/dashboardRoutes');
const userRoutes = require('./src/router/userRoutes');
const gameRoutes = require('./src/router/gameRoutes');
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
const referralRoutes = require('./src/router/referralRoutes');
const socialLinksRoutes = require('./src/router/socialLinksRoutes');
const affiliateManagementRoutes = require('./src/router/affiliateManagementRoutes');
const profileAuthRoutes = require('./src/router/profileAuthRoutes');
const advancedDashboardRoutes = require('./src/router/advancedDashboardRoutes');
const unifiedDashboardRoutes = require('./src/router/unifiedDashboardRoutes');
const adminAuth = require('./src/MiddleWare/AdminAuth');
const AdminController = require('./src/controllers/AdminController');

const app = express();

// CORS Configuration
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// MongoDB Connection (cached for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not set - database features will not work');
    return null;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    cachedDb = db;
    console.log('✅ MongoDB connected (serverless)');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return null;
  }
}

// Connect to database on first request
app.use(async (req, res, next) => {
  if (!cachedDb && process.env.MONGODB_URI) {
    await connectToDatabase();
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'BajiCrick API - Serverless Mode',
    version: '1.0.0',
    mode: 'serverless',
    timestamp: new Date().toISOString(),
    note: 'Socket.io features are disabled in serverless mode'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    mode: 'serverless'
  });
});

// API Routes
app.use('/api', apiRouter);
app.use('/api/v1', refactoredApiRouter); // New refactored routes
app.use('/api/admin', adminAurth);
app.use('/api/subadmin/auth', subAdminAurth);
app.use('/api/subadmin', subAdminRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sms', phoneVerificationRoute);
app.use('/api/turnover', turnoverRoutes);
app.use('/api/promotions', promotionsServiceRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/payment', paymentMethod);
app.use('/api/gateway', hierarchicalGatewayRoutes);
app.use('/api/affiliate/earnings', affiliateEarningsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/affiliate/links', affiliateLinkRoutes);
app.use('/api/affiliate/withdrawals', withdrawalRoutes);
app.use('/api/affiliate/profile', profileRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/agent/dashboard', agentDashboard);
app.use('/api/subadmin/dashboard', subAdminDashboard);
app.use('/api/subagent', subAgentRoutes);
app.use('/api/affiliate/dashboard', affiliateDashboardRoute);
app.use('/api/affiliate/auth', affiliateAuthRoute);
app.use('/api/announcements', announcementRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/vip', vipUserRoutes);
app.use('/api/realtime-bonus', realTimeBonusRoute);
app.use('/api/referral', referralRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/affiliate-management', affiliateManagementRoutes);
app.use('/api/profile-auth', profileAuthRoutes);
app.use('/api/advanced-dashboard', advancedDashboardRoutes);
app.use('/api/unified-dashboard', unifiedDashboardRoutes);

// Admin routes
app.post('/api/Admin/profileInfo', adminAuth, AdminController.getAdminInfo);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'Fail',
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
