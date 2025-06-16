
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

try {
  const app = require('./app');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('❌ Missing module:', err.message);
  } else {
    console.error('❌ Startup error:', err);
  }
  process.exit(1); // Exit gracefully
}
