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
const { initializeSocket, getConnectionStats, getUserConnections, getRoomInfo, sendToRoom } = require('./src/socket/socketServer');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);
app.set('io', io);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.CLIENT_URL || 'https://your-render-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','socket-id']
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cookieHandler);
app.use(mongoSanitize());
app.set('trust proxy', 1);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1', router);
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

// Socket monitoring
app.get('/api/socket/health', (req,res) => res.json({ status:'OK', ...getConnectionStats() }));
app.get('/api/socket/user/:userId', (req,res) => {
  const connections = getUserConnections(req.params.userId);
  res.json({ userId: req.params.userId, connections, totalConnections: connections.length });
});
app.get('/api/socket/room/:roomId', (req,res) => {
  const roomInfo = getRoomInfo(req.params.roomId);
  if (!roomInfo) return res.status(404).json({ error: 'Room not found' });
  res.json(roomInfo);
});
app.post('/api/socket/broadcast/:roomId', (req,res) => {
  const { event, message, data } = req.body;
  if (!event || !message) return res.status(400).json({ error: 'Event and message required' });
  const success = sendToRoom(req.params.roomId, event, { message, ...data, broadcastAt: new Date().toISOString() });
  if (success) return res.json({ success:true, message:`Event ${event} sent to room ${req.params.roomId}` });
  res.status(500).json({ error:'Failed to send message' });
});

// Health endpoints
app.get('/health', (req,res) => res.json({
  status:'OK', timestamp:new Date().toISOString(),
  uptime: process.uptime(), env: process.env.NODE_ENV || 'development'
}));
app.get('/', (req,res) => res.json({ message:"API is working 🚀", version:"1.0.0", socket:"Socket.io active", timestamp:new Date().toISOString() }));

// 404 handler
app.use('*', (req,res) => res.status(404).json({ message:"Route not found", path:req.originalUrl }));

// Global error handler
app.use((err,req,res,next) => {
  logger.error('[Global Error]', err);
  res.status(500).json({ message:'Internal server error' });
});

module.exports = { app, server };
