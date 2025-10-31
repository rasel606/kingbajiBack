// // // socket/gameSocket.js
// // const socketIO = require('socket.io');
// // const GameListTable = require('../models/GameListTable');
// // const User = require('../models/User');

// // let io;

// // exports.initializeSocket = (server) => {
// //   io = socketIO(server, {
// //     cors: {
// //       origin: process.env.CLIENT_URL || "http://localhost:3000",
// //       methods: ["GET", "POST"]
// //     }
// //   });

// //   io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     // Join user to their room for personal updates
// //     socket.on('join-user', (userId) => {
// //       socket.join(`user_${userId}`);
// //       console.log(`User ${userId} joined room user_${userId}`);
// //     });

// //     // Join category room for game updates
// //     socket.on('join-category', (category) => {
// //       socket.join(`category_${category}`);
// //       console.log(`Socket ${socket.id} joined category ${category}`);
// //     });

// //     // Handle real-time balance updates
// //     socket.on('request-balance-update', async (userId) => {
// //       try {
// //         const user = await User.findOne({ userId });
// //         if (user) {
// //           socket.emit('balance-updated', { 
// //             balance: user.balance,
// //             userId: userId
// //           });
// //           socket.to(`user_${userId}`).emit('balance-updated', {
// //             balance: user.balance,
// //             userId: userId
// //           });
// //         }
// //       } catch (error) {
// //         console.error('Error updating balance via socket:', error);
// //       }
// //     });

// //     // Handle game launch status
// //     socket.on('game-launch-status', (data) => {
// //       const { userId, gameId, status, message } = data;
// //       socket.emit('game-status-update', { gameId, status, message });
// //       socket.to(`user_${userId}`).emit('game-status-update', { 
// //         gameId, status, message 
// //       });
// //     });

// //     socket.on('disconnect', () => {
// //       console.log('User disconnected:', socket.id);
// //     });
// //   });

// //   return io;
// // };

// // // Function to emit game updates to all clients in a category
// // exports.emitGameUpdate = (category, gameData) => {
// //   if (io) {
// //     io.to(`category_${category}`).emit('games-updated', gameData);
// //   }
// // };

// // // Function to emit balance updates to specific user
// // exports.emitBalanceUpdate = (userId, balance) => {
// //   if (io) {
// //     io.to(`user_${userId}`).emit('balance-updated', { 
// //       balance, 
// //       userId 
// //     });
// //   }
// // };

// // // Function to emit new game added
// // exports.emitNewGame = (category, game) => {
// //   if (io) {
// //     io.to(`category_${category}`).emit('new-game-added', game);
// //   }
// // };

// // // Function to emit game status change
// // exports.emitGameStatusChange = (category, gameId, status) => {
// //   if (io) {
// //     io.to(`category_${category}`).emit('game-status-changed', {
// //       gameId,
// //       status
// //     });
// //   }
// // };

// // socket/gameSocket.js
// const socketIO = require('socket.io');
// const GameListTable = require('../models/GameListTable');
// const User = require('../models/User');

// let io;

// exports.initializeSocket = (server) => {
//   io = socketIO(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "http://localhost:3000",
//       methods: ["GET", "POST"]
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     // Join user to their room for personal updates
//     socket.on('join-user', (userId) => {
//       socket.join(`user_${userId}`);
//       console.log(`User ${userId} joined room user_${userId}`);
//     });

//     // Join category room for game updates
//     socket.on('join-category', (category) => {
//       socket.join(`category_${category}`);
//       console.log(`Socket ${socket.id} joined category ${category}`);
//     });

//     // Join provider room for provider-specific updates
//     socket.on('join-provider', (provider) => {
//       socket.join(`provider_${provider}`);
//       console.log(`Socket ${socket.id} joined provider ${provider}`);
//     });

//     // Handle real-time balance updates
//     socket.on('request-balance-update', async (userId) => {
//       try {
//         const user = await User.findOne({ userId });
//         if (user) {
//           socket.emit('balance-updated', { 
//             balance: user.balance,
//             userId: userId
//           });
//           socket.to(`user_${userId}`).emit('balance-updated', {
//             balance: user.balance,
//             userId: userId
//           });
//         }
//       } catch (error) {
//         console.error('Error updating balance via socket:', error);
//       }
//     });

//     // Handle game launch status
//     socket.on('game-launch-status', (data) => {
//       const { userId, gameId, status, message } = data;
//       socket.emit('game-status-update', { gameId, status, message });
//       socket.to(`user_${userId}`).emit('game-status-update', { 
//         gameId, status, message 
//       });
//     });

//     // Handle live game activity
//     socket.on('game-activity', (data) => {
//       const { category, gameId, userId, action } = data;
//       socket.to(`category_${category}`).emit('live-game-activity', {
//         gameId,
//         userId: userId ? userId.substring(0, 3) + '***' : 'Anonymous', // Partial anonymization
//         action,
//         timestamp: new Date()
//       });
//     });

//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//     });
//   });

//   return io;
// };

// // Function to emit game updates to all clients in a category
// exports.emitGameUpdate = (category, gameData) => {
//   if (io) {
//     io.to(`category_${category}`).emit('games-updated', gameData);
//   }
// };

// // Function to emit balance updates to specific user
// exports.emitBalanceUpdate = (userId, balance) => {
//   if (io) {
//     io.to(`user_${userId}`).emit('balance-updated', { 
//       balance, 
//       userId 
//     });
//   }
// };

// // Function to emit new game added
// exports.emitNewGame = (category, game) => {
//   if (io) {
//     io.to(`category_${category}`).emit('new-game-added', game);
//   }
// };

// // Function to emit game status change
// exports.emitGameStatusChange = (category, gameId, status) => {
//   if (io) {
//     io.to(`category_${category}`).emit('game-status-changed', {
//       gameId,
//       status,
//       timestamp: new Date()
//     });
//   }
// };

// // Function to emit game activity
// exports.emitGameActivity = (category, activity) => {
//   if (io) {
//     io.to(`category_${category}`).emit('live-game-activity', activity);
//   }
// };

// // Function to emit provider updates
// exports.emitProviderUpdate = (provider, data) => {
//   if (io) {
//     io.to(`provider_${provider}`).emit('provider-updated', data);
//   }
// };

// socket/gameSocket.js
const socketIO = require('socket.io');
const GameListTable = require('../Models/GameListTable');
const User = require('../Models/User');
const Category = require('../Models/Category');
const BetProviderTable = require('../Models/BetProviderTable');

let io;

exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room: user_${userId}`);
        
        // Send immediate balance update on join
        User.findOne({ userId }).then(user => {
          if (user) {
            socket.emit('balance-updated', {
              balance: user.balance,
              userId: userId
            });
          }
        }).catch(err => {
          console.error('Error fetching user balance on join:', err);
        });
      }
    });

    // Join category room for game updates
    socket.on('join-category', (category) => {
      if (category) {
        socket.join(`category_${category}`);
        console.log(`🎮 Socket ${socket.id} joined category: ${category}`);
      }
    });

    // Join provider room for provider-specific updates
    socket.on('join-provider', (provider) => {
      if (provider) {
        socket.join(`provider_${provider}`);
        console.log(`🏢 Socket ${socket.id} joined provider: ${provider}`);
      }
    });

    // Handle real-time balance update requests
    socket.on('request-balance-update', async (userId) => {
      try {
        if (!userId) {
          socket.emit('balance-error', { message: 'User ID required' });
          return;
        }

        const user = await User.findOne({ userId });
        if (user) {
          const balanceData = {
            balance: user.balance,
            userId: userId,
            timestamp: new Date()
          };
          
          // Send to requesting socket and all sockets in user's room
          socket.emit('balance-updated', balanceData);
          socket.to(`user_${userId}`).emit('balance-updated', balanceData);
          
          console.log(`💰 Balance update sent for user ${userId}: ${user.balance}`);
        } else {
          socket.emit('balance-error', { message: 'User not found' });
        }
      } catch (error) {
        console.error('Error updating balance via socket:', error);
        socket.emit('balance-error', { message: 'Server error' });
      }
    });

    // Handle game launch status updates from client
    socket.on('game-launch-status', (data) => {
      const { userId, gameId, status, message } = data;
      
      if (userId && gameId) {
        const statusData = {
          gameId,
          status,
          message: message || '',
          timestamp: new Date()
        };

        // Send to user and all sockets in user's room
        socket.emit('game-status-update', statusData);
        socket.to(`user_${userId}`).emit('game-status-update', statusData);
        
        console.log(`🎯 Game status update: ${gameId} - ${status} for user ${userId}`);
      }
    });

    // Handle live game activity
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

        // Broadcast to all sockets in the category room
        socket.to(`category_${category}`).emit('live-game-activity', activityData);
        
        console.log(`🎪 Live activity in ${category}: ${activityData.userId} ${action} ${gameName}`);
      }
    });

    // Handle game search/filter updates
    socket.on('game-filter-update', (data) => {
      const { category, filters } = data;
      if (category) {
        socket.to(`category_${category}`).emit('filters-updated', {
          filters,
          updatedBy: socket.id,
          timestamp: new Date()
        });
      }
    });

    // Handle admin game updates (new games, updates, etc.)
    socket.on('admin-game-update', async (data) => {
      try {
        const { action, gameId, category } = data;
        
        if (action === 'new-game' && category) {
          // Fetch the new game data
          const newGame = await GameListTable.findOne({ g_code: gameId })
            .populate('provider_details')
            .populate('category_details');
            
          if (newGame) {
            socket.to(`category_${category}`).emit('new-game-added', {
              game: newGame,
              action: 'added',
              timestamp: new Date()
            });
          }
        }
        
        // Broadcast to all admin clients
        socket.broadcast.emit('admin-notification', {
          type: 'game-update',
          data: data,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling admin game update:', error);
      }
    });

    // Handle connection health check
    socket.on('ping', (data) => {
      socket.emit('pong', {
        ...data,
        serverTime: new Date(),
        socketId: socket.id
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.id} - Reason: ${reason}`);
      
      // Clean up any user-specific data if needed
      socket.rooms.forEach(room => {
        if (room.startsWith('user_')) {
          console.log(`User left room: ${room}`);
        }
      });
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

  return io;
};

// Utility functions for emitting events from other parts of the application

// Emit game updates to all clients in a category
exports.emitGameUpdate = (category, gameData) => {
  if (io) {
    io.to(`category_${category}`).emit('games-updated', {
      ...gameData,
      timestamp: new Date()
    });
    console.log(`📢 Games updated in category: ${category}`);
  }
};

// Emit balance updates to specific user
exports.emitBalanceUpdate = (userId, balance) => {
  if (io && userId) {
    const balanceData = {
      balance,
      userId,
      timestamp: new Date()
    };
    
    io.to(`user_${userId}`).emit('balance-updated', balanceData);
    console.log(`💰 Balance update emitted for user ${userId}: ${balance}`);
  }
};

// Emit new game added to category
exports.emitNewGame = (category, game) => {
  if (io && category) {
    io.to(`category_${category}`).emit('new-game-added', {
      game,
      action: 'added',
      timestamp: new Date()
    });
    console.log(`🆕 New game added to category: ${category} - ${game.g_code}`);
  }
};

// Emit game status change
exports.emitGameStatusChange = (category, gameId, status, message = '') => {
  if (io && category && gameId) {
    const statusData = {
      gameId,
      status,
      message,
      timestamp: new Date()
    };
    
    io.to(`category_${category}`).emit('game-status-changed', statusData);
    console.log(`🎯 Game status changed: ${gameId} - ${status} in ${category}`);
  }
};

// Emit game activity
exports.emitGameActivity = (category, activity) => {
  if (io && category) {
    const activityData = {
      ...activity,
      timestamp: new Date()
    };
    
    io.to(`category_${category}`).emit('live-game-activity', activityData);
    console.log(`🎪 Live activity emitted in ${category}: ${activity.userId} ${activity.action}`);
  }
};

// Emit provider updates
exports.emitProviderUpdate = (provider, data) => {
  if (io && provider) {
    io.to(`provider_${provider}`).emit('provider-updated', {
      ...data,
      timestamp: new Date()
    });
    console.log(`🏢 Provider update emitted: ${provider}`);
  }
};

// Emit system-wide notifications
exports.emitSystemNotification = (message, type = 'info') => {
  if (io) {
    io.emit('system-notification', {
      message,
      type,
      timestamp: new Date()
    });
    console.log(`🔔 System notification: ${message}`);
  }
};

// Get connected clients count
exports.getConnectedClientsCount = () => {
  return io ? io.engine.clientsCount : 0;
};

// Get rooms information (for debugging/admin)
exports.getRoomsInfo = () => {
  if (!io) return {};
  
  const rooms = io.sockets.adapter.rooms;
  const roomInfo = {};
  
  rooms.forEach((_, roomName) => {
    roomInfo[roomName] = {
      clientCount: rooms.get(roomName)?.size || 0
    };
  });
  
  return roomInfo;
};