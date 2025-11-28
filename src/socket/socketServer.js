// // socket/socketServer.js
// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const AdminModel = require('../Models/AdminModel');
// const JWT_SECRET = "Kingbaji";

// let io;
// const connectedUsers = new Map();
// const connectedAdmins = new Map();
// const userSocketMap = new Map(); // socketId -> userInfo

// const initializeSocket = (server) => {
//   console.log('🚀 Initializing Socket.io server...');

//   io = new Server(server, {
//     cors: {
//       origin: ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002', 'http://127.0.0.1:3000'],
//       methods: ['GET', 'POST'],
//       credentials: true
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000,
//     connectionStateRecovery: {
//       maxDisconnectionDuration: 120000,
//       skipMiddlewares: true
//     }
//   });

//   console.log('✅ Socket.io server created with CORS configuration');

//   // Authentication middleware for Socket.io
// io.use(async (socket, next) => {
//   try {
//     console.log('🔐 Socket authentication attempt:', {
//       socketId: socket.id,
//       auth: socket.handshake.auth,
//       // query: socket.handshake.query,
//       timestamp: new Date().toISOString()
//     });

//     const token = socket.handshake.auth.token;
    
//     if (!token) {
//       console.error('❌ No token provided for socket authentication');
//       return next(new Error('Authentication error: No token provided'));
//     }

//     // Verify token (adjust based on your JWT verification)
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log('✅ Token decoded:', decoded);

//     // Find user in database
//     const user = await AdminModel.findOne({ 
//       $or: [
//         { userId: decoded.userId },
//         { email: decoded.email }
//       ]
//     }).select('-password');

//     if (!user) {
//       console.error('❌ User not found for socket authentication:', decoded);
//       return next(new Error('Authentication error: User not found'));
//     }

//     socket.userId = user.userId;
//     socket.userType = user.role;
//     socket.userName = user.name || user.firstName || user.userId;

//     console.log('✅ Socket authenticated successfully:', {
//       userId: socket.userId,
//       userType: socket.userType,
//       userName: socket.userName,
//       socketId: socket.id
//     });

//     next();
//   } catch (error) {
//     console.error('❌ Socket authentication error:', error.message);
//     next(new Error('Authentication error: Invalid token'));
//   }
// });

//   io.on('connection', (socket) => {
//     const connectionTime = new Date().toISOString();
//     console.log('✅ New socket connection established:', {
//       socketId: socket.id,
//       userId: socket.userId,
//       userType: socket.userType,
//       userName: socket.userName,
//       connectionTime
//     });

//     // Store user connection
//     userSocketMap.set(socket.id, {
//       userId: socket.userId,
//       userType: socket.userType,
//       userName: socket.userName,
//       connectedAt: connectionTime,
//       rooms: new Set()
//     });

//     if (socket.userType === 'user') {
//       connectedUsers.set(socket.userId, socket.id);
//     } else {
//       connectedAdmins.set(socket.userId, socket.id);
//     }

//     console.log('📊 Current connections after new connection:', {
//       totalUsers: connectedUsers.size,
//       totalAdmins: connectedAdmins.size,
//       totalConnections: connectedUsers.size + connectedAdmins.size
//     });

//     // Send connection confirmation
//     socket.emit('connected', {
//       socketId: socket.id,
//       userId: socket.userId,
//       userType: socket.userType,
//       connected: true,
//       timestamp: connectionTime
//     });

//     // Send authentication success
//     socket.emit('authenticated', {
//       message: 'Successfully authenticated',
//       userId: socket.userId,
//       userType: socket.userType,
//       userName: socket.userName,
//       timestamp: connectionTime
//     });

//     // Join user to their personal room for notifications
//     socket.join(socket.userId);
//     const userInfo = userSocketMap.get(socket.id);
//     userInfo.rooms.add(socket.userId);

//     console.log('👤 User joined personal room:', {
//       userId: socket.userId,
//       room: socket.userId,
//       socketId: socket.id,
//       timestamp: new Date().toISOString()
//     });

//     // Join chat room
//     socket.on('join_chat', (data) => {
//       const { roomId, userId, userType } = data;
      
//       console.log('🚀 Join chat request:', {
//         roomId,
//         userId,
//         userType,
//         socketId: socket.id,
//         timestamp: new Date().toISOString()
//       });

//       // Validate roomId
//       if (!roomId || !roomId.startsWith('chat_')) {
//         console.error('❌ Invalid room ID:', roomId);
//         socket.emit('join_error', {
//           error: 'Invalid room ID',
//           roomId,
//           timestamp: new Date().toISOString()
//         });
//         return;
//       }

//       // Leave previous chat rooms
//       const rooms = Array.from(socket.rooms);
//       rooms.forEach(room => {
//         if (room !== socket.id && room !== socket.userId && room.startsWith('chat_')) {
//           socket.leave(room);
//           userInfo.rooms.delete(room);
//           console.log('👋 Left previous room:', {
//             roomId: room,
//             socketId: socket.id,
//             timestamp: new Date().toISOString()
//           });
//         }
//       });

//       // Join new room
//       socket.join(roomId);
//       userInfo.rooms.add(roomId);

//       console.log('✅ User joined chat room:', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         socketId: socket.id,
//         currentRooms: Array.from(userInfo.rooms),
//         timestamp: new Date().toISOString()
//       });
      
//       socket.emit('room_joined', { 
//         roomId, 
//         success: true,
//         timestamp: new Date().toISOString()
//       });
      
//       // Notify others in the room
//       socket.to(roomId).emit('user_joined', {
//         userId: socket.userId,
//         userType: socket.userType,
//         userName: socket.userName,
//         socketId: socket.id,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Leave chat room
//     socket.on('leave_chat', (data) => {
//       const { roomId } = data;
//       socket.leave(roomId);
//       userInfo.rooms.delete(roomId);
      
//       console.log('👋 User left chat room:', {
//         roomId,
//         userId: socket.userId,
//         socketId: socket.id,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('user_left', {
//         userId: socket.userId,
//         userType: socket.userType,
//         userName: socket.userName,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Send new message
//     socket.on('new_message', (data) => {
//       const { roomId, message, senderId, senderType } = data;
      
//       console.log('📨 New message received:', {
//         roomId,
//         messageId: message._id,
//         senderId,
//         senderType,
//         socketId: socket.id,
//         timestamp: new Date().toISOString()
//       });

//       // Validate room membership
//       if (!socket.rooms.has(roomId)) {
//         console.error('❌ User not in room, cannot send message:', {
//           roomId,
//           userId: socket.userId,
//           socketId: socket.id
//         });
//         return;
//       }
      
//       // Broadcast to all in room except sender
//       const messageData = {
//         ...message,
//         socketId: socket.id,
//         delivered: true,
//         timestamp: new Date().toISOString()
//       };

//       socket.to(roomId).emit('new_message', messageData);

//       const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
//       console.log('✅ Message broadcasted to room:', {
//         roomId,
//         messageId: message._id,
//         recipients: roomSize - 1,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Typing indicators
//     socket.on('typing_start', (data) => {
//       const { roomId } = data;
//       console.log('⌨️ Typing started:', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('user_typing', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         userName: socket.userName,
//         typing: true,
//         timestamp: new Date().toISOString()
//       });
//     });

//     socket.on('typing_stop', (data) => {
//       const { roomId } = data;
//       console.log('⌨️ Typing stopped:', {
//         roomId,
//         userId: socket.userId,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('user_typing', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         userName: socket.userName,
//         typing: false,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Mark messages as read
//     socket.on('mark_messages_read', (data) => {
//       const { roomId } = data;
//       console.log('📖 Mark messages as read:', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('messages_read', {
//         roomId,
//         userId: socket.userId,
//         userType: socket.userType,
//         readAt: new Date().toISOString(),
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Update chat status
//     socket.on('chat_status_update', (data) => {
//       const { roomId, status } = data;
//       console.log('🔄 Chat status update:', {
//         roomId,
//         status,
//         updatedBy: socket.userId,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('chat_status_changed', {
//         roomId,
//         status,
//         updatedBy: socket.userId,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Admin assignment
//     socket.on('admin_assigned', (data) => {
//       const { roomId, adminId, adminName } = data;
//       console.log('👨‍💼 Admin assigned:', {
//         roomId,
//         adminId,
//         adminName,
//         timestamp: new Date().toISOString()
//       });

//       socket.to(roomId).emit('admin_joined_chat', {
//         roomId,
//         adminId,
//         adminName,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Ping pong for connection monitoring
//     socket.on('ping', (data) => {
//       console.log('🏓 Ping received:', {
//         socketId: socket.id,
//         userId: socket.userId,
//         // clientTime: data.timestamp,
//         timestamp: new Date().toISOString()
//       });

//       socket.emit('pong', { 
//         ...data,
//         serverTime: Date.now(),
//         serverTimestamp: new Date().toISOString(),
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Get connection info
//     socket.on('get_connection_info', () => {
//       console.log('📊 Connection info requested:', {
//         socketId: socket.id,
//         userId: socket.userId,
//         timestamp: new Date().toISOString()
//       });

//       const userInfo = userSocketMap.get(socket.id);
//       socket.emit('connection_info', {
//         socketId: socket.id,
//         userId: socket.userId,
//         userType: socket.userType,
//         userName: socket.userName,
//         connectedAt: userInfo?.connectedAt,
//         connectedRooms: Array.from(userInfo?.rooms || []),
//         totalConnections: connectedUsers.size + connectedAdmins.size,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Handle disconnection
//     socket.on('disconnect', (reason) => {
//       const disconnectTime = new Date().toISOString();
//       console.log('❌ Socket disconnected:', {
//         socketId: socket.id,
//         userId: socket.userId,
//         userType: socket.userType,
//         reason,
//         connectionDuration: getConnectionDuration(userSocketMap.get(socket.id)?.connectedAt),
//         timestamp: disconnectTime
//       });
      
//       // Remove from connected users
//       if (socket.userType === 'user') {
//         connectedUsers.delete(socket.userId);
//       } else {
//         connectedAdmins.delete(socket.userId);
//       }

//       // Remove from user socket map
//       const disconnectedUser = userSocketMap.get(socket.id);
//       userSocketMap.delete(socket.id);

//       console.log('📊 Connections after disconnect:', {
//         totalUsers: connectedUsers.size,
//         totalAdmins: connectedAdmins.size,
//         totalConnections: connectedUsers.size + connectedAdmins.size
//       });

//       // Notify rooms that user left
//       if (disconnectedUser?.rooms) {
//         disconnectedUser.rooms.forEach(room => {
//           if (room !== socket.id) {
//             socket.to(room).emit('user_left', {
//               userId: socket.userId,
//               userType: socket.userType,
//               userName: socket.userName,
//               reason,
//               timestamp: disconnectTime
//             });
//           }
//         });
//       }
//     });

//     // Error handling
//     socket.on('error', (error) => {
//       console.error('❌ Socket error:', {
//         socketId: socket.id,
//         userId: socket.userId,
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
//     });
//   });

//   // Global error handling
//   io.engine.on("connection_error", (err) => {
//     console.error('❌ Socket.io engine connection error:', {
//       error: err.message,
//       timestamp: new Date().toISOString()
//     });
//   });

//   console.log('✅ Socket.io server initialization completed');
//   return io;
// };

// // Helper function to calculate connection duration
// function getConnectionDuration(connectedAt) {
//   if (!connectedAt) return 'Unknown';
//   const duration = Date.now() - new Date(connectedAt).getTime();
//   const seconds = Math.floor(duration / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);

//   if (hours > 0) return `${hours}h ${minutes % 60}m`;
//   if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
//   return `${seconds}s`;
// }

// // Utility functions to use in routes
// const getSocket = () => {
//   console.log('📡 Getting socket instance');
//   return io;
// };

// const sendToRoom = (roomId, event, data) => {
//   if (io) {
//     console.log('📤 Sending to room:', {
//       roomId,
//       event,
//       data,
//       timestamp: new Date().toISOString()
//     });
//     io.to(roomId).emit(event, data);
//     return true;
//   }
//   console.error('❌ Socket.io not initialized');
//   return false;
// };

// const notifyUser = (userId, event, data) => {
//   if (io) {
//     console.log('📤 Notifying user:', {
//       userId,
//       event,
//       data,
//       timestamp: new Date().toISOString()
//     });
//     io.to(userId).emit(event, data);
//     return true;
//   }
//   return false;
// };

// const notifyAdmins = (event, data) => {
//   if (io) {
//     console.log('📢 Notifying all admins:', {
//       event,
//       data,
//       adminCount: connectedAdmins.size,
//       timestamp: new Date().toISOString()
//     });
    
//     connectedAdmins.forEach((socketId, adminId) => {
//       io.to(socketId).emit(event, data);
//     });
//   }
// };

// const getConnectionStats = () => {
//   const stats = {
//     totalUsers: connectedUsers.size,
//     totalAdmins: connectedAdmins.size,
//     totalConnections: connectedUsers.size + connectedAdmins.size,
//     connectedUsers: Array.from(connectedUsers.keys()),
//     connectedAdmins: Array.from(connectedAdmins.keys()),
//     totalSockets: userSocketMap.size,
//     timestamp: new Date().toISOString()
//   };

//   console.log('📊 Connection statistics:', stats);
//   return stats;
// };

// const getUserConnections = (userId) => {
//   const connections = [];
//   userSocketMap.forEach((info, socketId) => {
//     if (info.userId === userId) {
//       connections.push({
//         socketId,
//         ...info,
//         rooms: Array.from(info.rooms)
//       });
//     }
//   });
//   return connections;
// };

// const getRoomInfo = (roomId) => {
//   if (!io) return null;
  
//   const room = io.sockets.adapter.rooms.get(roomId);
//   if (!room) return null;

//   const clients = Array.from(room);
//   const clientInfo = clients.map(socketId => {
//     const info = userSocketMap.get(socketId);
//     return info ? { socketId, ...info } : { socketId, status: 'unknown' };
//   });

//   return {
//     roomId,
//     clientCount: clients.size,
//     clients: clientInfo
//   };
// };

// module.exports = {
//   initializeSocket,
//   getSocket,
//   sendToRoom,
//   notifyUser,
//   notifyAdmins,
//   getConnectionStats,
//   getUserConnections,
//   getRoomInfo
// };



// src/socket/socketServer.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const AdminModel = require('../Models/AdminModel');
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

let io;
const connectedUsers = new Map();
const connectedAdmins = new Map();
const userSocketMap = new Map();
const messageQueue = new Map(); // For offline message handling

class SocketManager {
  constructor() {
    this.connectionStats = {
      totalConnections: 0,
      totalUsers: 0,
      totalAdmins: 0,
      connectionErrors: 0,
      messagesSent: 0,
      messagesReceived: 0
    };
  }

  updateStats(type, count = 1) {
    this.connectionStats[type] += count;
  }

  getStats() {
    return {
      ...this.connectionStats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

const socketManager = new SocketManager();

const initializeSocket = (server) => {
  console.log('🚀 Initializing Socket.io server...');

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 120000,
      skipMiddlewares: true
    },
    maxHttpBufferSize: 1e8 // 100MB for file uploads
  });

  console.log('✅ Socket.io server created with CORS configuration');

  // Enhanced Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log('🔐 Socket authentication attempt:', {
        socketId: socket.id,
        hasToken: !!socket.handshake.auth.token,
        timestamp: new Date().toISOString()
      });

      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.error('❌ No token provided for socket authentication');
        socketManager.updateStats('connectionErrors');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token decoded successfully:', { 
        userId: decoded.userId, 
        role: decoded.role 
      });

      // Find user in database
      const user = await AdminModel.findOne({ 
        $or: [
          { userId: decoded.userId },
          { email: decoded.email }
        ]
      }).select('-password');

      if (!user) {
        console.error('❌ User not found for socket authentication:', decoded);
        socketManager.updateStats('connectionErrors');
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user info to socket
      socket.userId = user.userId;
      socket.userType = user.role;
      socket.userName = user.name || user.firstName || user.userId;
      socket.authenticated = true;

      console.log('✅ Socket authenticated successfully:', {
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        socketId: socket.id
      });

      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      socketManager.updateStats('connectionErrors');
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const connectionTime = new Date().toISOString();
    console.log('✅ New socket connection established:', {
      socketId: socket.id,
      userId: socket.userId,
      userType: socket.userType,
      userName: socket.userName,
      connectionTime
    });

    // Store user connection
    userSocketMap.set(socket.id, {
      userId: socket.userId,
      userType: socket.userType,
      userName: socket.userName,
      connectedAt: connectionTime,
      lastActivity: connectionTime,
      rooms: new Set(),
      isOnline: true
    });

    // Update connection maps
    if (socket.userType === 'user') {
      connectedUsers.set(socket.userId, socket.id);
      socketManager.updateStats('totalUsers');
    } else {
      connectedAdmins.set(socket.userId, socket.id);
      socketManager.updateStats('totalAdmins');
    }

    socketManager.updateStats('totalConnections');

    console.log('📊 Current connections:', {
      totalUsers: connectedUsers.size,
      totalAdmins: connectedAdmins.size,
      totalConnections: userSocketMap.size
    });

    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      userId: socket.userId,
      userType: socket.userType,
      connected: true,
      timestamp: connectionTime,
      connectionStats: socketManager.getStats()
    });

    // Send authentication success
    socket.emit('authenticated', {
      message: 'Successfully authenticated',
      userId: socket.userId,
      userType: socket.userType,
      userName: socket.userName,
      timestamp: connectionTime
    });

    // Join user to their personal room
    socket.join(socket.userId);
    const userInfo = userSocketMap.get(socket.id);
    userInfo.rooms.add(socket.userId);

    console.log('👤 User joined personal room:', {
      userId: socket.userId,
      room: socket.userId,
      socketId: socket.id
    });

    // Handle chat room joining
    socket.on('join_chat', (data) => {
      const { roomId, userId, userType } = data;
      
      console.log('🚀 Join chat request:', {
        roomId,
        userId,
        userType,
        socketId: socket.id
      });

      // Validate roomId
      if (!roomId || !roomId.startsWith('chat_')) {
        console.error('❌ Invalid room ID:', roomId);
        socket.emit('join_error', {
          error: 'Invalid room ID',
          roomId,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Leave previous chat rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id && room !== socket.userId && room.startsWith('chat_')) {
          socket.leave(room);
          userInfo.rooms.delete(room);
          console.log('👋 Left previous room:', {
            roomId: room,
            socketId: socket.id
          });
        }
      });

      // Join new room
      socket.join(roomId);
      userInfo.rooms.add(roomId);
      userInfo.lastActivity = new Date().toISOString();

      console.log('✅ User joined chat room:', {
        roomId,
        userId: socket.userId,
        userType: socket.userType,
        socketId: socket.id,
        currentRooms: Array.from(userInfo.rooms)
      });
      
      socket.emit('room_joined', { 
        roomId, 
        success: true,
        timestamp: new Date().toISOString()
      });
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Leave chat room
    socket.on('leave_chat', (data) => {
      const { roomId } = data;
      socket.leave(roomId);
      userInfo.rooms.delete(roomId);
      userInfo.lastActivity = new Date().toISOString();
      
      console.log('👋 User left chat room:', {
        roomId,
        userId: socket.userId,
        socketId: socket.id
      });

      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        timestamp: new Date().toISOString()
      });
    });

    // Send new message with enhanced validation
    socket.on('new_message', (data) => {
      const { roomId, message, senderId, senderType, messageId } = data;
      
      // Validate message data
      if (!roomId || !messageId || !senderId) {
        console.error('❌ Invalid message data:', data);
        socket.emit('message_error', {
          error: 'Invalid message data',
          messageId,
          timestamp: new Date().toISOString()
        });
        return;
      }

      console.log('📨 New message received:', {
        roomId,
        messageId,
        senderId,
        senderType,
        socketId: socket.id
      });

      // Validate room membership
      if (!socket.rooms.has(roomId)) {
        console.error('❌ User not in room, cannot send message:', {
          roomId,
          userId: socket.userId,
          socketId: socket.id
        });
        socket.emit('message_error', {
          error: 'Not in room',
          messageId,
          roomId,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Broadcast to all in room except sender
      const messageData = {
        ...message,
        socketId: socket.id,
        delivered: true,
        timestamp: new Date().toISOString(),
        messageId
      };

      socket.to(roomId).emit('new_message', messageData);
      socketManager.updateStats('messagesSent');

      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      console.log('✅ Message broadcasted to room:', {
        roomId,
        messageId,
        recipients: roomSize - 1
      });

      // Send delivery confirmation
      socket.emit('message_delivered', {
        messageId,
        delivered: true,
        timestamp: new Date().toISOString()
      });
    });

    // Enhanced typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      console.log('⌨️ Typing started:', {
        roomId,
        userId: socket.userId,
        userType: socket.userType
      });

      socket.to(roomId).emit('user_typing', {
        roomId,
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        typing: true,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      console.log('⌨️ Typing stopped:', {
        roomId,
        userId: socket.userId
      });

      socket.to(roomId).emit('user_typing', {
        roomId,
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        typing: false,
        timestamp: new Date().toISOString()
      });
    });

    // Mark messages as read
    socket.on('mark_messages_read', (data) => {
      const { roomId, messageIds } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      console.log('📖 Mark messages as read:', {
        roomId,
        userId: socket.userId,
        userType: socket.userType,
        messageIds
      });

      socket.to(roomId).emit('messages_read', {
        roomId,
        userId: socket.userId,
        userType: socket.userType,
        messageIds,
        readAt: new Date().toISOString()
      });
    });

    // Update chat status
    socket.on('chat_status_update', (data) => {
      const { roomId, status, reason } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      console.log('🔄 Chat status update:', {
        roomId,
        status,
        reason,
        updatedBy: socket.userId
      });

      socket.to(roomId).emit('chat_status_changed', {
        roomId,
        status,
        reason,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Admin assignment
    socket.on('admin_assigned', (data) => {
      const { roomId, adminId, adminName } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      console.log('👨‍💼 Admin assigned:', {
        roomId,
        adminId,
        adminName
      });

      socket.to(roomId).emit('admin_joined_chat', {
        roomId,
        adminId,
        adminName,
        timestamp: new Date().toISOString()
      });
    });

    // File upload progress
    socket.on('file_upload_progress', (data) => {
      const { roomId, fileId, progress, fileName } = data;
      
      if (!socket.rooms.has(roomId)) {
        return;
      }

      socket.to(roomId).emit('file_upload_progress_update', {
        roomId,
        fileId,
        progress,
        fileName,
        uploadedBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Ping pong for connection monitoring
    socket.on('ping', (data) => {
      const pingData = {
        ...data,
        serverTime: Date.now(),
        serverTimestamp: new Date().toISOString(),
        socketId: socket.id
      };

      console.log('🏓 Ping received:', pingData);

      socket.emit('pong', pingData);
      userInfo.lastActivity = new Date().toISOString();
    });

    // Get connection info
    socket.on('get_connection_info', () => {
      console.log('📊 Connection info requested:', {
        socketId: socket.id,
        userId: socket.userId
      });

      const userInfo = userSocketMap.get(socket.id);
      socket.emit('connection_info', {
        socketId: socket.id,
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        connectedAt: userInfo?.connectedAt,
        lastActivity: userInfo?.lastActivity,
        connectedRooms: Array.from(userInfo?.rooms || []),
        totalConnections: userSocketMap.size,
        connectionStats: socketManager.getStats(),
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      const disconnectTime = new Date().toISOString();
      console.log('❌ Socket disconnected:', {
        socketId: socket.id,
        userId: socket.userId,
        userType: socket.userType,
        reason,
        connectionDuration: getConnectionDuration(userSocketMap.get(socket.id)?.connectedAt),
        timestamp: disconnectTime
      });
      
      // Remove from connected users
      if (socket.userType === 'user') {
        connectedUsers.delete(socket.userId);
        socketManager.connectionStats.totalUsers = Math.max(0, socketManager.connectionStats.totalUsers - 1);
      } else {
        connectedAdmins.delete(socket.userId);
        socketManager.connectionStats.totalAdmins = Math.max(0, socketManager.connectionStats.totalAdmins - 1);
      }

      // Update user info
      const disconnectedUser = userSocketMap.get(socket.id);
      if (disconnectedUser) {
        disconnectedUser.isOnline = false;
        disconnectedUser.disconnectedAt = disconnectTime;
      }

      socketManager.connectionStats.totalConnections = userSocketMap.size;

      console.log('📊 Connections after disconnect:', {
        totalUsers: connectedUsers.size,
        totalAdmins: connectedAdmins.size,
        totalConnections: userSocketMap.size
      });

      // Notify rooms that user left
      if (disconnectedUser?.rooms) {
        disconnectedUser.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.to(room).emit('user_left', {
              userId: socket.userId,
              userType: socket.userType,
              userName: socket.userName,
              reason,
              timestamp: disconnectTime
            });
          }
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', {
        socketId: socket.id,
        userId: socket.userId,
        error: error.message
      });
      socketManager.updateStats('connectionErrors');
    });
  });

  // Global error handling
  io.engine.on("connection_error", (err) => {
    console.error('❌ Socket.io engine connection error:', {
      error: err.message,
      timestamp: new Date().toISOString()
    });
    socketManager.updateStats('connectionErrors');
  });

  console.log('✅ Socket.io server initialization completed');
  return io;
};

// Helper function to calculate connection duration
function getConnectionDuration(connectedAt) {
  if (!connectedAt) return 'Unknown';
  const duration = Date.now() - new Date(connectedAt).getTime();
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Utility functions to use in routes
const getSocket = () => {
  console.log('📡 Getting socket instance');
  return io;
};

const sendToRoom = (roomId, event, data) => {
  if (io) {
    console.log('📤 Sending to room:', {
      roomId,
      event,
      data: Object.keys(data),
      timestamp: new Date().toISOString()
    });
    io.to(roomId).emit(event, data);
    socketManager.updateStats('messagesSent');
    return true;
  }
  console.error('❌ Socket.io not initialized');
  return false;
};

const notifyUser = (userId, event, data) => {
  if (io) {
    console.log('📤 Notifying user:', {
      userId,
      event,
      data: Object.keys(data)
    });
    io.to(userId).emit(event, data);
    socketManager.updateStats('messagesSent');
    return true;
  }
  return false;
};

const notifyAdmins = (event, data) => {
  if (io) {
    console.log('📢 Notifying all admins:', {
      event,
      data: Object.keys(data),
      adminCount: connectedAdmins.size
    });
    
    connectedAdmins.forEach((socketId, adminId) => {
      io.to(socketId).emit(event, data);
    });
    socketManager.updateStats('messagesSent', connectedAdmins.size);
  }
};

const getConnectionStats = () => {
  const stats = {
    ...socketManager.getStats(),
    connectedUsers: Array.from(connectedUsers.keys()),
    connectedAdmins: Array.from(connectedAdmins.keys()),
    totalSockets: userSocketMap.size,
    timestamp: new Date().toISOString()
  };

  console.log('📊 Connection statistics:', stats);
  return stats;
};

const getUserConnections = (userId) => {
  const connections = [];
  userSocketMap.forEach((info, socketId) => {
    if (info.userId === userId) {
      connections.push({
        socketId,
        ...info,
        rooms: Array.from(info.rooms),
        isOnline: info.isOnline
      });
    }
  });
  return connections;
};

const getRoomInfo = (roomId) => {
  if (!io) return null;
  
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return null;

  const clients = Array.from(room);
  const clientInfo = clients.map(socketId => {
    const info = userSocketMap.get(socketId);
    return info ? { 
      socketId, 
      ...info,
      rooms: Array.from(info.rooms)
    } : { socketId, status: 'unknown' };
  });

  return {
    roomId,
    clientCount: clients.size,
    clients: clientInfo,
    timestamp: new Date().toISOString()
  };
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId) || connectedAdmins.has(userId);
};

const getOnlineUsers = () => {
  return {
    users: Array.from(connectedUsers.keys()),
    admins: Array.from(connectedAdmins.keys()),
    total: connectedUsers.size + connectedAdmins.size
  };
};

module.exports = {
  initializeSocket,
  getSocket,
  sendToRoom,
  notifyUser,
  notifyAdmins,
  getConnectionStats,
  getUserConnections,
  getRoomInfo,
  isUserOnline,
  getOnlineUsers,
  socketManager
};