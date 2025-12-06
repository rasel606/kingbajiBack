// // const socketIO = require('socket.io');
// // const logger = require('../utils/logger');

// // let io;
// // const connectedUsers = new Map();
// // const connectedAdmins = new Map();
// // const typingUsers = new Map();

// // const initializeSocket = (server) => {
// //   io = socketIO(server, {
// //     cors: {
// //       origin: ['http://localhost:3000', 'http://localhost:3001'],
// //       methods: ['GET', 'POST'],
// //       credentials: true
// //     },
// //     transports: ['websocket', 'polling']
// //   });

// //   io.on('connection', (socket) => {
// //     logger.info(`🔌 Live Chat Socket connected: ${socket.id}`);

// //     // Join chat room
// //     socket.on('join_chat', async (data) => {
// //       const { roomId, userId, userType } = data;
      
// //       socket.join(roomId);
      
// //       if (userType === 'user') {
// //         connectedUsers.set(userId, socket.id);
// //         logger.info(`👤 User ${userId} joined room ${roomId}`);
// //       } else if (userType === 'admin') {
// //         connectedAdmins.set(userId, socket.id);
// //         logger.info(`👨‍💼 Admin ${userId} joined room ${roomId}`);
// //       }

// //       // Update last seen
// //       try {
// //         const { ChatRoom } = require('../Models/Chat');
// //         const chatRoom = await ChatRoom.findOne({ roomId });
        
// //         if (chatRoom) {
// //           chatRoom.lastSeen[userType] = new Date();
// //           chatRoom.unreadCount[userType] = 0;
// //           await chatRoom.save();

// //           socket.to(roomId).emit('user_seen', {
// //             userId,
// //             userType,
// //             seenAt: new Date()
// //           });
// //         }
// //       } catch (error) {
// //         logger.error('Error updating last seen:', error);
// //       }

// //       socket.to(roomId).emit('user_joined', {
// //         userId,
// //         userType,
// //         socketId: socket.id
// //       });
// //     });

// //     // Typing indicators
// //     socket.on('typing_start', async (data) => {
// //       const { roomId, userId, userType } = data;
      
// //       typingUsers.set(userId, { roomId, userType, socketId: socket.id });
      
// //       try {
// //         const { ChatRoom } = require('../Models/Chat');
// //         await ChatRoom.findOneAndUpdate(
// //           { roomId },
// //           { 
// //             [`isTyping.${userType}`]: true,
// //             updatedAt: new Date()
// //           }
// //         );

// //         socket.to(roomId).emit('user_typing', {
// //           userId,
// //           userType,
// //           typing: true
// //         });

// //         // Auto stop typing after 3 seconds
// //         setTimeout(() => {
// //           if (typingUsers.get(userId)?.roomId === roomId) {
// //             socket.emit('typing_stop', { roomId, userId, userType });
// //           }
// //         }, 3000);

// //       } catch (error) {
// //         logger.error('Typing start error:', error);
// //       }
// //     });

// //     socket.on('typing_stop', async (data) => {
// //       const { roomId, userId, userType } = data;
      
// //       typingUsers.delete(userId);
      
// //       try {
// //         const { ChatRoom } = require('../Models/Chat');
// //         await ChatRoom.findOneAndUpdate(
// //           { roomId },
// //           { 
// //             [`isTyping.${userType}`]: false,
// //             updatedAt: new Date()
// //           }
// //         );

// //         socket.to(roomId).emit('user_typing', {
// //           userId,
// //           userType,
// //           typing: false
// //         });
// //       } catch (error) {
// //         logger.error('Typing stop error:', error);
// //       }
// //     });

// //     // Message read receipt
// //     socket.on('mark_messages_read', async (data) => {
// //       const { roomId, userId, userType } = data;
      
// //       try {
// //         const { ChatRoom } = require('../Models/Chat');
// //         const chatRoom = await ChatRoom.findOne({ roomId });
        
// //         if (chatRoom) {
// //           let unreadCount = 0;
// //           chatRoom.messages.forEach(msg => {
// //             if (msg.senderType !== userType && !msg.read) {
// //               msg.read = true;
// //               msg.readBy.push({
// //                 userId: userId,
// //                 readAt: new Date()
// //               });
// //               unreadCount++;
// //             }
// //           });

// //           chatRoom.lastSeen[userType] = new Date();
// //           chatRoom.unreadCount[userType] = 0;
// //           await chatRoom.save();

// //           socket.to(roomId).emit('messages_read', {
// //             userId,
// //             userType,
// //             readAt: new Date(),
// //             unreadCount
// //           });
// //         }
// //       } catch (error) {
// //         logger.error('Mark messages read error:', error);
// //       }
// //     });

// //     // File upload progress (optional)
// //     socket.on('file_upload_progress', (data) => {
// //       const { roomId, progress, fileName } = data;
// //       socket.to(roomId).emit('file_upload_progress', {
// //         progress,
// //         fileName,
// //         userId: socket.userId
// //       });
// //     });

// //     // Disconnect
// //     socket.on('disconnect', () => {
// //       logger.info(`🔌 Live Chat Socket disconnected: ${socket.id}`);
      
// //       // Remove from connected users
// //       for (let [userId, socketId] of connectedUsers.entries()) {
// //         if (socketId === socket.id) {
// //           connectedUsers.delete(userId);
// //           break;
// //         }
// //       }
      
// //       // Remove from connected admins
// //       for (let [adminId, socketId] of connectedAdmins.entries()) {
// //         if (socketId === socket.id) {
// //           connectedAdmins.delete(adminId);
// //           break;
// //         }
// //       }

// //       // Remove from typing
// //       for (let [userId, data] of typingUsers.entries()) {
// //         if (data.socketId === socket.id) {
// //           typingUsers.delete(userId);
// //           break;
// //         }
// //       }
// //     });

// //     // Error handling
// //     socket.on('error', (error) => {
// //       logger.error(`❌ Live Chat Socket error: ${error.message}`);
// //     });
// //   });

// //   return io;
// // };

// // const getConnectedClientsCount = () => {
// //   return {
// //     users: connectedUsers.size,
// //     admins: connectedAdmins.size,
// //     total: connectedUsers.size + connectedAdmins.size
// //   };
// // };

// // const getRoomsInfo = () => {
// //   if (!io) return {};
  
// //   const rooms = io.sockets.adapter.rooms;
// //   const roomInfo = {};
  
// //   rooms.forEach((sockets, roomId) => {
// //     roomInfo[roomId] = {
// //       clients: sockets.size,
// //       isChatRoom: roomId.startsWith('chat_')
// //     };
// //   });
  
// //   return roomInfo;
// // };

// // // Utility function to send notification to admins
// // const notifyAdmins = (event, data) => {
// //   if (io) {
// //     connectedAdmins.forEach((socketId, adminId) => {
// //       io.to(socketId).emit(event, data);
// //     });
// //   }
// // };

// // // Utility function to send message to specific user
// // const sendToUser = (userId, event, data) => {
// //   if (io && connectedUsers.has(userId)) {
// //     const socketId = connectedUsers.get(userId);
// //     io.to(socketId).emit(event, data);
// //   }
// // };

// // // Utility function to send message to specific admin
// // const sendToAdmin = (adminId, event, data) => {
// //   if (io && connectedAdmins.has(adminId)) {
// //     const socketId = connectedAdmins.get(adminId);
// //     io.to(socketId).emit(event, data);
// //   }
// // };

// // module.exports = {
// //   initializeSocket,
// //   getConnectedClientsCount,
// //   getRoomsInfo,
// //   notifyAdmins,
// //   sendToUser,
// //   sendToAdmin,
// //   io: () => io
// // };



// const socketIO = require('socket.io');
// const logger = require('../utils/logger');

// let io;
// const connectedUsers = new Map();
// const connectedAdmins = new Map();
// const typingUsers = new Map();
// const userSocketMap = new Map(); // userId -> socketId mapping

// const initializeSocket = (server) => {
//   io = socketIO(server, {
//     cors: {
//       origin: ['http://localhost:3000', 'http://localhost:3001'],
//       methods: ['GET', 'POST'],
//       credentials: true
//     },
//     transports: ['websocket', 'polling'],
//     pingTimeout: 60000,
//     pingInterval: 25000
//   });

//   io.on('connection', (socket) => {
//     logger.info(`🔌 Live Chat Socket connected: ${socket.id}`);

//     // Store socket connection with user data
//     socket.on('authenticate', (data) => {
//       const { userId, userType } = data;
      
//       if (userType === 'user') {
//         connectedUsers.set(userId, socket.id);
//         userSocketMap.set(socket.id, { userId, userType });
//         logger.info(`👤 User ${userId} authenticated on socket ${socket.id}`);
//       } else if (userType === 'admin') {
//         connectedAdmins.set(userId, socket.id);
//         userSocketMap.set(socket.id, { userId, userType });
//         logger.info(`👨‍💼 Admin ${userId} authenticated on socket ${socket.id}`);
//       }
//     });

//     // Join chat room
//     socket.on('join_chat', async (data) => {
//       const { roomId, userId, userType } = data;
      
//       try {
//         // Leave previous rooms
//         const rooms = Array.from(socket.rooms);
//         rooms.forEach(room => {
//           if (room !== socket.id && room.startsWith('chat_')) {
//             socket.leave(room);
//           }
//         });

//         socket.join(roomId);
        
//         if (userType === 'user') {
//           connectedUsers.set(userId, socket.id);
//           userSocketMap.set(socket.id, { userId, userType });
//           logger.info(`👤 User ${userId} joined room ${roomId}`);
//         } else if (userType === 'admin') {
//           connectedAdmins.set(userId, socket.id);
//           userSocketMap.set(socket.id, { userId, userType });
//           logger.info(`👨‍💼 Admin ${userId} joined room ${roomId}`);
//         }

//         // Update last seen
//         try {
//           const { ChatRoom } = require('../models/Chat');
//           const chatRoom = await ChatRoom.findOne({ roomId });
          
//           if (chatRoom) {
//             chatRoom.lastSeen[userType] = new Date();
//             chatRoom.unreadCount[userType] = 0;
//             await chatRoom.save();

//             socket.to(roomId).emit('user_seen', {
//               userId,
//               userType,
//               seenAt: new Date()
//             });

//             // Notify about unread count update
//             socket.emit('unread_update', {
//               roomId,
//               unreadCount: chatRoom.unreadCount
//             });
//           }
//         } catch (error) {
//           logger.error('Error updating last seen:', error);
//         }

//         // Notify others in the room
//         socket.to(roomId).emit('user_joined', {
//           userId,
//           userType,
//           socketId: socket.id,
//           timestamp: new Date()
//         });

//         // Send room info to the joining user
//         socket.emit('room_joined', {
//           roomId,
//           success: true,
//           message: `Successfully joined room ${roomId}`
//         });

//       } catch (error) {
//         logger.error('Join chat error:', error);
//         socket.emit('join_error', {
//           error: 'Failed to join chat room',
//           roomId
//         });
//       }
//     });

//     // Typing indicators
//     socket.on('typing_start', async (data) => {
//       const { roomId, userId, userType } = data;
      
//       try {
//         typingUsers.set(userId, { roomId, userType, socketId: socket.id, timestamp: new Date() });
        
//         const { ChatRoom } = require('../models/Chat');
//         await ChatRoom.findOneAndUpdate(
//           { roomId },
//           { 
//             [`isTyping.${userType}`]: true,
//             updatedAt: new Date()
//           }
//         );

//         socket.to(roomId).emit('user_typing', {
//           userId,
//           userType,
//           typing: true,
//           timestamp: new Date()
//         });

//         logger.debug(`⌨️ ${userType} ${userId} started typing in room ${roomId}`);

//         // Auto stop typing after 3 seconds
//         setTimeout(() => {
//           if (typingUsers.get(userId)?.roomId === roomId) {
//             socket.emit('typing_stop', { roomId, userId, userType });
//           }
//         }, 3000);

//       } catch (error) {
//         logger.error('Typing start error:', error);
//       }
//     });

//     socket.on('typing_stop', async (data) => {
//       const { roomId, userId, userType } = data;
      
//       try {
//         typingUsers.delete(userId);
        
//         const { ChatRoom } = require('../models/Chat');
//         await ChatRoom.findOneAndUpdate(
//           { roomId },
//           { 
//             [`isTyping.${userType}`]: false,
//             updatedAt: new Date()
//           }
//         );

//         socket.to(roomId).emit('user_typing', {
//           userId,
//           userType,
//           typing: false,
//           timestamp: new Date()
//         });

//         logger.debug(`⌨️ ${userType} ${userId} stopped typing in room ${roomId}`);
//       } catch (error) {
//         logger.error('Typing stop error:', error);
//       }
//     });

//     // Message read receipt
//     socket.on('mark_messages_read', async (data) => {
//       const { roomId, userId, userType } = data;
      
//       try {
//         const { ChatRoom } = require('../models/Chat');
//         const chatRoom = await ChatRoom.findOne({ roomId });
        
//         if (chatRoom) {
//           let unreadCount = 0;
//           chatRoom.messages.forEach(msg => {
//             if (msg.senderType !== userType && !msg.read) {
//               msg.read = true;
//               msg.readBy.push({
//                 userId: userId,
//                 readAt: new Date()
//               });
//               unreadCount++;
//             }
//           });

//           chatRoom.lastSeen[userType] = new Date();
//           chatRoom.unreadCount[userType] = 0;
//           await chatRoom.save();

//           socket.to(roomId).emit('messages_read', {
//             userId,
//             userType,
//             readAt: new Date(),
//             unreadCount,
//             roomId
//           });

//           // Update all clients in the room about unread count
//           io.to(roomId).emit('unread_update', {
//             roomId,
//             unreadCount: chatRoom.unreadCount
//           });

//           logger.info(`📖 ${userType} ${userId} marked messages as read in room ${roomId}`);
//         }
//       } catch (error) {
//         logger.error('Mark messages read error:', error);
//         socket.emit('read_error', {
//           error: 'Failed to mark messages as read',
//           roomId
//         });
//       }
//     });

//     // New message event (for real-time message delivery)
//     socket.on('new_message', async (data) => {
//       const { roomId, message, senderId, senderType } = data;
      
//       try {
//         // Broadcast to all in room except sender
//         socket.to(roomId).emit('new_message', {
//           ...message,
//           roomId,
//           isLive: true
//         });

//         // Notify admins about new message (if from user)
//         if (senderType === 'user') {
//           notifyAdmins('new_chat_message', {
//             roomId,
//             message: message.message || 'New message',
//             userName: message.senderName,
//             timestamp: new Date()
//           });
//         }

//         logger.info(`💬 New message in room ${roomId} from ${senderType} ${senderId}`);
//       } catch (error) {
//         logger.error('New message broadcast error:', error);
//       }
//     });

//     // File upload progress
//     socket.on('file_upload_progress', (data) => {
//       const { roomId, progress, fileName, userId } = data;
//       socket.to(roomId).emit('file_upload_progress', {
//         progress,
//         fileName,
//         userId,
//         timestamp: new Date()
//       });
//     });

//     // Chat status updates
//     socket.on('chat_status_update', (data) => {
//       const { roomId, status, updatedBy } = data;
      
//       io.to(roomId).emit('chat_status_changed', {
//         roomId,
//         status,
//         updatedBy,
//         timestamp: new Date()
//       });

//       logger.info(`🔄 Chat ${roomId} status changed to ${status} by ${updatedBy}`);
//     });

//     // Admin assigned to chat
//     socket.on('admin_assigned', (data) => {
//       const { roomId, adminId, adminName } = data;
      
//       io.to(roomId).emit('admin_joined_chat', {
//         roomId,
//         adminId,
//         adminName,
//         timestamp: new Date()
//       });

//       logger.info(`👨‍💼 Admin ${adminName} assigned to chat ${roomId}`);
//     });

//     // Ping/Pong for connection health
//     socket.on('ping', () => {
//       socket.emit('pong', { timestamp: new Date() });
//     });

//     // Get connection info
//     socket.on('get_connection_info', () => {
//       const userInfo = userSocketMap.get(socket.id);
//       socket.emit('connection_info', {
//         socketId: socket.id,
//         userInfo,
//         connectedAt: new Date(),
//         rooms: Array.from(socket.rooms)
//       });
//     });

//     // Disconnect handler
//     socket.on('disconnect', (reason) => {
//       const userInfo = userSocketMap.get(socket.id);
      
//       if (userInfo) {
//         const { userId, userType } = userInfo;
        
//         if (userType === 'user') {
//           connectedUsers.delete(userId);
//         } else if (userType === 'admin') {
//           connectedAdmins.delete(userId);
//         }
        
//         userSocketMap.delete(socket.id);
//         typingUsers.delete(userId);
        
//         logger.info(`🔌 ${userType} ${userId} disconnected: ${socket.id} - Reason: ${reason}`);
//       } else {
//         logger.info(`🔌 Unknown socket disconnected: ${socket.id} - Reason: ${reason}`);
//       }

//       // Clean up typing indicators for this socket
//       for (let [userId, data] of typingUsers.entries()) {
//         if (data.socketId === socket.id) {
//           typingUsers.delete(userId);
//         }
//       }
//     });

//     // Error handling
//     socket.on('error', (error) => {
//       logger.error(`❌ Socket error for ${socket.id}:`, error);
//     });
//   });

//   // Global error handling
//   io.engine.on("connection_error", (err) => {
//     logger.error(`❌ Socket.io connection error:`, err);
//   });

//   return io;
// };

// // Get connected clients count
// const getConnectedClientsCount = () => {
//   return {
//     users: connectedUsers.size,
//     admins: connectedAdmins.size,
//     total: connectedUsers.size + connectedAdmins.size,
//     typing: typingUsers.size
//   };
// };

// // Get rooms information
// const getRoomsInfo = () => {
//   if (!io) return {};
  
//   const rooms = io.sockets.adapter.rooms;
//   const roomInfo = {};
  
//   rooms.forEach((sockets, roomId) => {
//     if (roomId.startsWith('chat_')) {
//       const clients = Array.from(sockets);
//       const clientInfo = clients.map(socketId => {
//         return userSocketMap.get(socketId) || { socketId, type: 'unknown' };
//       });
      
//       roomInfo[roomId] = {
//         clients: sockets.size,
//         clientInfo,
//         isChatRoom: true
//       };
//     }
//   });
  
//   return roomInfo;
// };

// // Utility function to send notification to all admins
// const notifyAdmins = (event, data) => {
//   if (io) {
//     connectedAdmins.forEach((socketId, adminId) => {
//       io.to(socketId).emit(event, data);
//     });
//     logger.debug(`📢 Notified ${connectedAdmins.size} admins about: ${event}`);
//   }
// };

// // Utility function to send message to specific user
// const sendToUser = (userId, event, data) => {
//   if (io && connectedUsers.has(userId)) {
//     const socketId = connectedUsers.get(userId);
//     io.to(socketId).emit(event, data);
//     logger.debug(`📤 Sent ${event} to user ${userId}`);
//     return true;
//   }
//   logger.warn(`⚠️ User ${userId} not connected for event: ${event}`);
//   return false;
// };

// // Utility function to send message to specific admin
// const sendToAdmin = (adminId, event, data) => {
//   if (io && connectedAdmins.has(adminId)) {
//     const socketId = connectedAdmins.get(adminId);
//     io.to(socketId).emit(event, data);
//     logger.debug(`📤 Sent ${event} to admin ${adminId}`);
//     return true;
//   }
//   logger.warn(`⚠️ Admin ${adminId} not connected for event: ${event}`);
//   return false;
// };

// // Send message to room
// const sendToRoom = (roomId, event, data) => {
//   if (io) {
//     io.to(roomId).emit(event, data);
//     logger.debug(`📤 Sent ${event} to room ${roomId}`);
//     return true;
//   }
//   return false;
// };

// // Get user socket info
// const getUserSocketInfo = (userId) => {
//   if (connectedUsers.has(userId)) {
//     return {
//       socketId: connectedUsers.get(userId),
//       type: 'user',
//       connected: true
//     };
//   } else if (connectedAdmins.has(userId)) {
//     return {
//       socketId: connectedAdmins.get(userId),
//       type: 'admin',
//       connected: true
//     };
//   }
//   return { connected: false };
// };

// // Check if user is connected
// const isUserConnected = (userId) => {
//   return connectedUsers.has(userId) || connectedAdmins.has(userId);
// };

// // Get all connected users
// const getAllConnectedUsers = () => {
//   return {
//     users: Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
//       userId,
//       socketId,
//       type: 'user',
//       userInfo: userSocketMap.get(socketId)
//     })),
//     admins: Array.from(connectedAdmins.entries()).map(([adminId, socketId]) => ({
//       adminId,
//       socketId,
//       type: 'admin',
//       userInfo: userSocketMap.get(socketId)
//     }))
//   };
// };

// module.exports = {
//   initializeSocket,
//   getConnectedClientsCount,
//   getRoomsInfo,
//   notifyAdmins,
//   sendToUser,
//   sendToAdmin,
//   sendToRoom,
//   getUserSocketInfo,
//   isUserConnected,
//   getAllConnectedUsers,
//   io: () => io
// };


// socket/socketConfig.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
const connectedUsers = new Map();
const connectedAdmins = new Map();

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userType = decoded.role === 'user' ? 'user' : 'admin';
      socket.userData = decoded;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ New socket connection:', socket.id, socket.userId, socket.userType);

    // Store user connection
    if (socket.userType === 'user') {
      connectedUsers.set(socket.userId, socket.id);
    } else {
      connectedAdmins.set(socket.userId, socket.id);
    }

    // Send authentication success
    socket.emit('authenticated', {
      message: 'Successfully authenticated',
      userId: socket.userId,
      userType: socket.userType
    });

    // Join chat room
    socket.on('join_chat', async (data) => {
      const { roomId } = data;
      
      try {
        // Leave previous rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room !== socket.id && room.startsWith('chat_')) {
            socket.leave(room);
          }
        });

        // Join new room
        socket.join(roomId);
        
        console.log(`👤 ${socket.userType} ${socket.userId} joined room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userType: socket.userType,
          socketId: socket.id,
          timestamp: new Date()
        });

        // Confirm room join
        socket.emit('room_joined', {
          roomId,
          success: true,
          message: `Successfully joined room ${roomId}`
        });

      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('join_error', {
          error: 'Failed to join chat room',
          roomId
        });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userType: socket.userType,
        typing: true,
        timestamp: new Date()
      });

      console.log(`⌨️ ${socket.userType} ${socket.userId} started typing in ${roomId}`);
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userType: socket.userType,
        typing: false,
        timestamp: new Date()
      });

      console.log(`⌨️ ${socket.userType} ${socket.userId} stopped typing in ${roomId}`);
    });

    // New message
    socket.on('new_message', (data) => {
      const { roomId, message } = data;
      
      // Broadcast to all in room except sender
      socket.to(roomId).emit('new_message', {
        ...message,
        roomId,
        isLive: true,
        timestamp: new Date()
      });

      console.log(`💬 New message in ${roomId} from ${socket.userType} ${socket.userId}`);
    });

    // Mark messages as read
    socket.on('mark_messages_read', (data) => {
      const { roomId } = data;
      
      socket.to(roomId).emit('messages_read', {
        userId: socket.userId,
        userType: socket.userType,
        readAt: new Date(),
        roomId
      });

      console.log(`📖 ${socket.userType} ${socket.userId} marked messages as read in ${roomId}`);
    });

    // Chat status updates
    socket.on('chat_status_update', (data) => {
      const { roomId, status } = data;
      
      io.to(roomId).emit('chat_status_changed', {
        roomId,
        status,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

      console.log(`🔄 Chat ${roomId} status changed to ${status} by ${socket.userId}`);
    });

    // Admin assigned
    socket.on('admin_assigned', (data) => {
      const { roomId, adminName } = data;
      
      io.to(roomId).emit('admin_joined_chat', {
        roomId,
        adminId: socket.userId,
        adminName,
        timestamp: new Date()
      });

      console.log(`👨‍💼 Admin ${adminName} assigned to chat ${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} - ${socket.userType} ${socket.userId} - Reason: ${reason}`);
      
      // Remove from connected users
      if (socket.userType === 'user') {
        connectedUsers.delete(socket.userId);
      } else {
        connectedAdmins.delete(socket.userId);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

// Utility functions
const getConnectedClientsCount = () => {
  return {
    users: connectedUsers.size,
    admins: connectedAdmins.size,
    total: connectedUsers.size + connectedAdmins.size
  };
};

const notifyAdmins = (event, data) => {
  if (io) {
    connectedAdmins.forEach((socketId, adminId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

const sendToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initializeSocket,
  getConnectedClientsCount,
  notifyAdmins,
  sendToRoom,
  io: () => io
};