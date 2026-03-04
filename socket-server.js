// Create: backend/socket-server.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SOCKET_PORT || 3001;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Import your socket handlers
const { initializeSocket } = require('./src/socket/socketServer');
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🔌 Socket.IO Server running on port ${PORT}`);
});

module.exports = { io };
