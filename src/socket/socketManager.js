const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Store all socket instances
const socketInstances = {};

const initializeSockets = (server) => {
  // Create single Socket.io instance with namespace support
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    allowUpgrades: true,
    maxHttpBufferSize: 1e8
  });

  // Store main io instance
  socketInstances.io = io;

  // Initialize namespaces
  initializeGameNamespace(io);
  initializeChatNamespace(io);
  initializeAdminNamespace(io);

  logger.info('✅ All socket namespaces initialized');

  return socketInstances;
};

// Game Namespace
const initializeGameNamespace = (io) => {
  const gameNamespace = io.of('/games');
  
  gameNamespace.on('connection', (socket) => {
    logger.info(`🎮 Game client connected: ${socket.id}`);
    
    // Join user to their personal room
    socket.on('join-user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        logger.info(`👤 User ${userId} joined game room: user_${userId}`);
        
        // Send immediate balance update
        const User = require('../Models/User');
        User.findOne({ userId }).then(user => {
          if (user) {
            socket.emit('balance-updated', {
              balance: user.balance,
              userId: userId
            });
          }
        }).catch(err => {
          logger.error('Error fetching user balance on join:', err);
        });
      }
    });

    // Join category room for game updates
    socket.on('join-category', (category) => {
      if (category) {
        socket.join(`category_${category}`);
        logger.info(`🎮 Socket ${socket.id} joined category: ${category}`);
      }
    });

    // Handle real-time balance update requests
    socket.on('request-balance-update', async (userId) => {
      try {
        if (!userId) {
          socket.emit('balance-error', { message: 'User ID required' });
          return;
        }

        const User = require('../Models/User');
        const user = await User.findOne({ userId });
        if (user) {
          const balanceData = {
            balance: user.balance,
            userId: userId,
            timestamp: new Date()
          };
          
          socket.emit('balance-updated', balanceData);
          socket.to(`user_${userId}`).emit('balance-updated', balanceData);
          
          logger.info(`💰 Balance update sent for user ${userId}: ${user.balance}`);
        } else {
          socket.emit('balance-error', { message: 'User not found' });
        }
      } catch (error) {
        logger.error('Error updating balance via socket:', error);
        socket.emit('balance-error', { message: 'Server error' });
      }
    });

    // Handle game activity
    socket.on('game-activity', (data) => {
      const { category, gameId, userId, action, gameName } = data;
      
      if (category && gameId) {
        const activityData = {
          gameId,
          gameName: gameName || 'Unknown Game',
          userId: userId ? `${userId.substring(0, 3)}***` : 'Anonymous',
          action: action || 'played',
          timestamp: new Date()
        };

        gameNamespace.to(`category_${category}`).emit('live-game-activity', activityData);
        logger.info(`🎪 Live activity in ${category}: ${activityData.userId} ${action} ${gameName}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`🎮 Game client disconnected: ${socket.id} - Reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      logger.error('Game socket connection error:', error);
    });
  });

  socketInstances.game = gameNamespace;
};

// Chat Namespace
const initializeChatNamespace = (io) => {
  const chatNamespace = io.of('/chat');
  
  // Authentication middleware for chat
  chatNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logger.warn('Chat socket authentication failed: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userType = decoded.role === 'user' ? 'user' : 'admin';
      socket.userData = decoded;
      
      logger.info(`💬 Chat socket authenticated: ${socket.userType} ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Chat socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    logger.info(`💬 Chat client connected: ${socket.id} - ${socket.userType} ${socket.userId}`);

    // Send authentication success
    socket.emit('authenticated', {
      message: 'Successfully authenticated',
      userId: socket.userId,
      userType: socket.userType,
      socketId: socket.id
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

        socket.join(roomId);
        logger.info(`👤 ${socket.userType} ${socket.userId} joined chat room: ${roomId}`);

        // Update last seen in database
        try {
          const { ChatRoom } = require('../Models/Chat');
          const chatRoom = await ChatRoom.findOne({ roomId });
          
          if (chatRoom) {
            chatRoom.lastSeen[socket.userType] = new Date();
            if (socket.userType === 'user') {
              chatRoom.unreadCount.user = 0;
            } else {
              chatRoom.unreadCount.admin = 0;
            }
            await chatRoom.save();

            socket.to(roomId).emit('user_seen', {
              userId: socket.userId,
              userType: socket.userType,
              seenAt: new Date()
            });

            socket.emit('unread_update', {
              roomId,
              unreadCount: chatRoom.unreadCount
            });
          }
        } catch (dbError) {
          logger.error('Error updating last seen:', dbError);
        }

        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userType: socket.userType,
          socketId: socket.id,
          timestamp: new Date()
        });

        socket.emit('room_joined', {
          roomId,
          success: true,
          message: `Successfully joined room ${roomId}`
        });

      } catch (error) {
        logger.error('Join chat error:', error);
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

      logger.debug(`⌨️ ${socket.userType} ${socket.userId} started typing in ${roomId}`);
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userType: socket.userType,
        typing: false,
        timestamp: new Date()
      });

      logger.debug(`⌨️ ${socket.userType} ${socket.userId} stopped typing in ${roomId}`);
    });

    // New message event
    socket.on('new_message', (data) => {
      const { roomId, message } = data;
      
      chatNamespace.to(roomId).except(socket.id).emit('new_message', {
        ...message,
        roomId,
        isLive: true,
        timestamp: new Date()
      });

      logger.info(`💬 New message in ${roomId} from ${socket.userType} ${socket.userId}`);
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      const { roomId } = data;
      
      try {
        const { ChatRoom } = require('../Models/Chat');
        const chatRoom = await ChatRoom.findOne({ roomId });
        
        if (chatRoom) {
          let unreadCount = 0;
          chatRoom.messages.forEach(msg => {
            if (msg.senderType !== socket.userType && !msg.read) {
              msg.read = true;
              msg.readBy.push({
                userId: socket.userId,
                readAt: new Date()
              });
              unreadCount++;
            }
          });

          chatRoom.lastSeen[socket.userType] = new Date();
          chatRoom.unreadCount[socket.userType] = 0;
          await chatRoom.save();

          socket.to(roomId).emit('messages_read', {
            userId: socket.userId,
            userType: socket.userType,
            readAt: new Date(),
            roomId
          });

          chatNamespace.to(roomId).emit('unread_update', {
            roomId,
            unreadCount: chatRoom.unreadCount
          });

          logger.info(`📖 ${socket.userType} ${socket.userId} marked messages as read in ${roomId}`);
        }
      } catch (error) {
        logger.error('Mark messages read error:', error);
        socket.emit('read_error', {
          error: 'Failed to mark messages as read',
          roomId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`💬 Chat client disconnected: ${socket.id} - ${socket.userType} ${socket.userId} - Reason: ${reason}`);
    });
  });

  socketInstances.chat = chatNamespace;
};

// Admin Namespace
const initializeAdminNamespace = (io) => {
  const adminNamespace = io.of('/admin');
  
  adminNamespace.on('connection', (socket) => {
    logger.info(`👨‍💼 Admin client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`👨‍💼 Admin client disconnected: ${socket.id} - Reason: ${reason}`);
    });
  });

  socketInstances.admin = adminNamespace;
};

// Utility functions
const getSocketInstances = () => socketInstances;

const getGameSocket = () => socketInstances.game;
const getChatSocket = () => socketInstances.chat;
const getAdminSocket = () => socketInstances.admin;

// Utility function to send notification to all admins
const notifyAdmins = (event, data) => {
  if (socketInstances.chat) {
    // This would need to track connected admins
    socketInstances.chat.emit(event, data);
  }
};

// Utility function to send message to room
const sendToRoom = (roomId, event, data) => {
  if (socketInstances.chat) {
    socketInstances.chat.to(roomId).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initializeSockets,
  getSocketInstances,
  getGameSocket,
  getChatSocket,
  getAdminSocket,
  notifyAdmins,
  sendToRoom
};