// Create: backend/socket-server.js
require('dotenv').config();
const http = require('http');

// Import your socket handlers
// initializeSocket creates and configures the io instance
const { initializeSocket } = require('./src/socket/socketServer');

// NOTE: This file is for STANDALONE testing of the socket server.
// The main application entry point is `index.js`, which already integrates
// the socket server with the Express app on port 5000.
// Do NOT run this file and `index.js` at the same time if they use the same port.

const PORT = process.env.SOCKET_PORT || 3001; // Use a different port to avoid conflict with the main app

const server = http.createServer();
const io = initializeSocket(server); // initializeSocket creates and configures the io instance

server.listen(PORT, () => {
  console.log(`🔌 STANDALONE Socket.IO Server running on port ${PORT}`);
  console.log('   This is for testing purposes only. Use `npm start` to run the main application.');
});

module.exports = { io };
