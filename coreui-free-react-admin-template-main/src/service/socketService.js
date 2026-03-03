import { io } from 'socket.io-client'

// class SocketService {
//   constructor() {
//     this.socket = null;
//     this.isConnected = false;
//     this.isAuthenticated = false;
//     this.eventCallbacks = new Map();
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//   }

//  connect(token, user) {
//   console.log("🔌 Socket connection attempt:", {
//     token: token ? 'present' : 'missing',
//     user: user ? 'present' : 'missing',
//     userId: user?.userId

//   });
// console.log("Token:", token, "User:", user);
//   // Don't attempt connection without token or user
//   // if (!token || !user) {
//   //   console.error('❌ Cannot connect socket: Missing token or user data');
//   //   console.log("Token:", token, "User:", user, "Error:", error);
//   //   this.emitEvent('connection_error', {
//   //     error: 'Authentication data missing',
//   //     token: !!token,
//   //     user: !!user
//   //   });
//   //   return;
//   // }

//   try {
//     // Disconnect existing connection
//     if (this.socket) {
//       this.disconnect();
//     }

//     console.log('🔌 Initializing socket connection...', {
//       userId: user.userId,
//       userType: user.role,
//       hasToken: !!token
//     });
// console.log("Token:", token, "User:", user);
//     // Create new connection with proper authentication
//     this.socket = io('http://localhost:3001', {
//       auth: {
//         token: token
//       },
//       query: {
//         userId: user.userId,
//         userType: user.role === 'user' ? 'user' : 'Admin'
//       },
//       transports: ['websocket', 'polling'],
//       timeout: 10000,
//       forceNew: true
//     });

//     this.setupEventListeners();

//   } catch (error) {
//     console.error('❌ Socket connection initialization error:', error);
//     this.emitEvent('connection_error', { error: error.message });
//   }
// }

//   setupEventListeners() {
//     if (!this.socket) return;

//     // Connection events
//     this.socket.on('connect', () => {
//       console.log('✅ Socket connected:', this.socket.id);
//       this.isConnected = true;
//       this.reconnectAttempts = 0;
//       this.emitEvent('connected', {
//         socketId: this.socket.id,
//         connected: true
//       });
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log('❌ Socket disconnected:', reason);
//       this.isConnected = false;
//       this.isAuthenticated = false;
//       this.emitEvent('disconnected', {
//         reason,
//         connected: false
//       });

//       // Attempt reconnect for certain disconnect reasons
//       if (reason === 'io server disconnect') {
//         setTimeout(() => {
//           if (this.socket) {
//             this.socket.connect();
//           }
//         }, 1000);
//       }
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('❌ Socket connection error:', error.message);
//       this.isConnected = false;
//       this.reconnectAttempts++;

//       this.emitEvent('connection_error', {
//         error: error.message,
//         attempt: this.reconnectAttempts,
//         maxAttempts: this.maxReconnectAttempts
//       });

//       if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.error('🚨 Max reconnection attempts reached');
//         this.emitEvent('reconnection_failed', {
//           error: 'Max reconnection attempts reached'
//         });
//       }
//     });

//     // Authentication events
//     this.socket.on('authenticated', (data) => {
//       console.log('✅ Socket authenticated:', data);
//       this.isAuthenticated = true;
//       this.emitEvent('authenticated', data);
//     });

//     this.socket.on('unauthorized', (error) => {
//       console.error('❌ Socket unauthorized:', error);
//       this.isAuthenticated = false;
//       this.emitEvent('unauthorized', { error });
//     });

//     // Chat events
//     this.socket.on('new_message', (data) => {
//       console.log('📨 New message received:', data);
//       this.emitEvent('new_message', data);
//     });

//     this.socket.on('user_typing', (data) => {
//       this.emitEvent('user_typing', data);
//     });

//     this.socket.on('messages_read', (data) => {
//       this.emitEvent('messages_read', data);
//     });

//     this.socket.on('unread_update', (data) => {
//       this.emitEvent('unread_update', data);
//     });

//     this.socket.on('chat_status_changed', (data) => {
//       this.emitEvent('chat_status_changed', data);
//     });

//     this.socket.on('admin_joined_chat', (data) => {
//       this.emitEvent('admin_joined_chat', data);
//     });

//     this.socket.on('chat_closed', (data) => {
//       this.emitEvent('chat_closed', data);
//     });

//     this.socket.on('new_chat_created', (data) => {
//       this.emitEvent('new_chat_created', data);
//     });

//     this.socket.on('user_joined', (data) => {
//       this.emitEvent('user_joined', data);
//     });

//     this.socket.on('user_seen', (data) => {
//       this.emitEvent('user_seen', data);
//     });

//     // Room events
//     this.socket.on('room_joined', (data) => {
//       console.log('✅ Joined room:', data);
//       this.emitEvent('room_joined', data);
//     });

//     this.socket.on('join_error', (data) => {
//       console.error('❌ Join room error:', data);
//       this.emitEvent('join_error', data);
//     });

//     this.socket.on('read_error', (data) => {
//       console.error('❌ Read error:', data);
//       this.emitEvent('read_error', data);
//     });

//     // Connection info
//     this.socket.on('connection_info', (data) => {
//       this.emitEvent('connection_info', data);
//     });

//     // Ping/Pong
//     this.socket.on('pong', (data) => {
//       this.emitEvent('pong', data);
//     });
//   }

//   // Join chat room
//   joinChat(roomId, userId, userType) {
//     if (!this.socket || !this.isConnected) {
//       console.warn('⚠️ Socket not connected, cannot join room');
//       return false;
//     }

//     try {
//       this.socket.emit('join_chat', {
//         roomId,
//         userId,
//         userType
//       });
//       console.log(`🚀 Joining room: ${roomId} as ${userType}`);
//       return true;
//     } catch (error) {
//       console.error('❌ Error joining room:', error);
//       return false;
//     }
//   }

//   // Send new message
//   sendNewMessage(roomId, message, senderId, senderType) {
//     if (!this.socket || !this.isConnected) {
//       console.warn('⚠️ Socket not connected, cannot send message');
//       return false;
//     }

//     try {
//       this.socket.emit('new_message', {
//         roomId,
//         message,
//         senderId,
//         senderType
//       });
//       console.log('📤 Message sent via socket:', { roomId, messageId: message._id });
//       return true;
//     } catch (error) {
//       console.error('❌ Error sending message:', error);
//       return false;
//     }
//   }

//   // Typing indicators
//   startTyping(roomId, userId, userType) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('typing_start', {
//         roomId,
//         userId,
//         userType
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error starting typing:', error);
//       return false;
//     }
//   }

//   stopTyping(roomId, userId, userType) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('typing_stop', {
//         roomId,
//         userId,
//         userType
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error stopping typing:', error);
//       return false;
//     }
//   }

//   // Mark messages as read
//   markMessagesRead(roomId, userId, userType) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('mark_messages_read', {
//         roomId,
//         userId,
//         userType
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error marking messages read:', error);
//       return false;
//     }
//   }

//   // Update chat status
//   updateChatStatus(roomId, status, userId) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('chat_status_update', {
//         roomId,
//         status,
//         updatedBy: userId
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error updating chat status:', error);
//       return false;
//     }
//   }

//   // Notify admin assignment
//   notifyAdminAssignment(roomId, adminId, adminName) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('admin_assigned', {
//         roomId,
//         adminId,
//         adminName
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error notifying admin assignment:', error);
//       return false;
//     }
//   }

//   // File upload progress
//   sendFileUploadProgress(roomId, progress, fileName, userId) {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('file_upload_progress', {
//         roomId,
//         progress,
//         fileName,
//         userId
//       });
//       return true;
//     } catch (error) {
//       console.error('❌ Error sending file upload progress:', error);
//       return false;
//     }
//   }

//   // Ping server
//   ping() {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('ping');
//       return true;
//     } catch (error) {
//       console.error('❌ Error sending ping:', error);
//       return false;
//     }
//   }

//   // Get connection info
//   getConnectionInfo() {
//     if (!this.socket || !this.isConnected) return false;

//     try {
//       this.socket.emit('get_connection_info');
//       return true;
//     } catch (error) {
//       console.error('❌ Error getting connection info:', error);
//       return false;
//     }
//   }

//   // Event management
//   on(event, callback) {
//     if (!this.eventCallbacks.has(event)) {
//       this.eventCallbacks.set(event, []);
//     }
//     this.eventCallbacks.get(event).push(callback);

//     // Return unsubscribe function
//     return () => this.off(event, callback);
//   }

//   off(event, callback) {
//     if (this.eventCallbacks.has(event)) {
//       const callbacks = this.eventCallbacks.get(event);
//       const index = callbacks.indexOf(callback);
//       if (index > -1) {
//         callbacks.splice(index, 1);
//       }
//     }
//   }

//   emitEvent(event, data) {
//     if (this.eventCallbacks.has(event)) {
//       this.eventCallbacks.get(event).forEach(callback => {
//         try {
//           callback(data);
//         } catch (error) {
//           console.error(`❌ Error in event callback for ${event}:`, error);
//         }
//       });
//     }
//   }

//   // Connection status
//   getConnectionStatus() {
//     return {
//       isConnected: this.isConnected,
//       isAuthenticated: this.isAuthenticated,
//       socketId: this.socket?.id,
//       connected: this.socket?.connected,
//       reconnectAttempts: this.reconnectAttempts
//     };
//   }

//   // Manual reconnect
//   reconnect() {
//     if (this.socket) {
//       this.socket.connect();
//     }
//   }

//   // Disconnect
//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//     this.isConnected = false;
//     this.isAuthenticated = false;
//     this.eventCallbacks.clear();
//     console.log('🔌 Socket disconnected');
//   }
// }

// // Create singleton instance
// export const socketService = new SocketService();

// src/service/socketService.js
class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.isAuthenticated = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.eventListeners = new Map()
    this.connectionStatus = 'disconnected'
    this.pingInterval = null
    this.connectionStats = {
      messagesSent: 0,
      messagesReceived: 0,
      connectionErrors: 0,
      reconnectAttempts: 0,
    }
  }

  // Connect to socket server
  connect(token, user) {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.disconnect()
        }

        console.log('🔌 Connecting to socket server...', {
          hasToken: !!token,
          userId: user?.userId,
        })

        this.socket = io('http://localhost:3001', {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        })

        this.setupEventListeners()

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.handleConnectionError(new Error('Connection timeout'))
            reject(new Error('Connection timeout'))
          }
        }, 10000)

        // Resolve when connected and authenticated
        const onAuthenticated = (data) => {
          clearTimeout(connectionTimeout)
          this.isAuthenticated = true
          this.connectionStatus = 'authenticated'
          console.log('✅ Socket authenticated successfully:', data)
          resolve(this.socket)
        }

        this.socket.once('authenticated', onAuthenticated)
        this.socket.once('connect_error', (error) => {
          clearTimeout(connectionTimeout)
          this.handleConnectionError(error)
          reject(error)
        })
      } catch (error) {
        console.error('❌ Socket connection error:', error)
        this.handleConnectionError(error)
        reject(error)
      }
    })
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected')
      this.isConnected = true
      this.connectionStatus = 'connected'
      this.reconnectAttempts = 0
      this.emit('socket_connected', {
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      this.isConnected = false
      this.isAuthenticated = false
      this.connectionStatus = 'disconnected'
      this.emit('socket_disconnected', { reason, timestamp: new Date().toISOString() })

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnection()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      this.connectionStats.connectionErrors++
      this.emit('socket_error', { error: error.message, timestamp: new Date().toISOString() })
    })

    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data)
      this.isAuthenticated = true
      this.connectionStatus = 'authenticated'
      this.emit('socket_authenticated', data)
    })

    this.socket.on('unauthorized', (data) => {
      console.error('❌ Socket unauthorized:', data)
      this.isAuthenticated = false
      this.connectionStatus = 'unauthorized'
      this.emit('socket_unauthorized', data)
    })

    // Chat events
    this.socket.on('new_message', (data) => {
      console.log('📨 New message received:', data)
      this.connectionStats.messagesReceived++
      this.emit('new_message', data)
    })

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data)
    })

    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data)
    })

    this.socket.on('unread_update', (data) => {
      this.emit('unread_update', data)
    })

    this.socket.on('chat_status_changed', (data) => {
      this.emit('chat_status_changed', data)
    })

    this.socket.on('admin_joined_chat', (data) => {
      this.emit('admin_joined_chat', data)
    })

    this.socket.on('chat_closed', (data) => {
      this.emit('chat_closed', data)
    })

    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data)
    })

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data)
    })

    this.socket.on('room_joined', (data) => {
      this.emit('room_joined', data)
    })

    this.socket.on('join_error', (data) => {
      this.emit('join_error', data)
    })

    this.socket.on('message_delivered', (data) => {
      this.emit('message_delivered', data)
    })

    this.socket.on('message_error', (data) => {
      this.emit('message_error', data)
    })

    // Utility events
    this.socket.on('pong', (data) => {
      this.emit('pong', data)
    })

    this.socket.on('connection_info', (data) => {
      this.emit('connection_info', data)
    })

    // Start ping interval
    this.startPingInterval()
  }

  // Join chat room
  joinChat(roomId, userId, userType) {
    if (!this.socket || !this.isConnected || !this.isAuthenticated) {
      console.error('❌ Cannot join chat: Socket not ready')
      return false
    }

    try {
      this.socket.emit('join_chat', {
        roomId,
        userId,
        userType,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error joining chat:', error)
      return false
    }
  }

  // Leave chat room
  leaveChat(roomId) {
    if (!this.socket || !this.isConnected) {
      return false
    }

    try {
      this.socket.emit('leave_chat', { roomId })
      return true
    } catch (error) {
      console.error('❌ Error leaving chat:', error)
      return false
    }
  }

  // Send new message
  sendNewMessage(roomId, message, senderId, senderType) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Cannot send message: Socket not connected')
      return false
    }

    try {
      const messageData = {
        roomId,
        message: {
          ...message,
          delivered: false,
        },
        senderId,
        senderType,
        messageId:
          message.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }

      this.socket.emit('new_message', messageData)
      this.connectionStats.messagesSent++
      return true
    } catch (error) {
      console.error('❌ Error sending message:', error)
      return false
    }
  }

  // Typing indicators
  startTyping(roomId, userId, userType) {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('typing_start', {
        roomId,
        userId,
        userType,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error starting typing indicator:', error)
      return false
    }
  }

  stopTyping(roomId, userId, userType) {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('typing_stop', {
        roomId,
        userId,
        userType,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error stopping typing indicator:', error)
      return false
    }
  }

  // Mark messages as read
  markMessagesRead(roomId, userId, userType, messageIds = []) {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('mark_messages_read', {
        roomId,
        userId,
        userType,
        messageIds,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error marking messages as read:', error)
      return false
    }
  }

  // Update chat status
  updateChatStatus(roomId, status, userId, reason = '') {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('chat_status_update', {
        roomId,
        status,
        reason,
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error updating chat status:', error)
      return false
    }
  }

  // Notify admin assignment
  notifyAdminAssignment(roomId, adminId, adminName) {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('admin_assigned', {
        roomId,
        adminId,
        adminName,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error notifying admin assignment:', error)
      return false
    }
  }

  // File upload progress
  sendFileUploadProgress(roomId, fileId, progress, fileName) {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('file_upload_progress', {
        roomId,
        fileId,
        progress,
        fileName,
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error sending file upload progress:', error)
      return false
    }
  }

  // Ping for connection monitoring
  sendPing() {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('ping', {
        clientTime: Date.now(),
        timestamp: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('❌ Error sending ping:', error)
      return false
    }
  }

  // Get connection info
  getConnectionInfo() {
    if (!this.socket || !this.isConnected) return false

    try {
      this.socket.emit('get_connection_info')
      return true
    } catch (error) {
      console.error('❌ Error getting connection info:', error)
      return false
    }
  }

  // Event management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Connection management
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.isConnected = false
    this.isAuthenticated = false
    this.connectionStatus = 'disconnected'
    this.eventListeners.clear()
  }

  reconnect() {
    console.log('🔄 Attempting to reconnect...')
    this.disconnect()
    // Reconnection will be handled automatically by socket.io
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      socketId: this.socket?.id,
      connectionStatus: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      connectionStats: this.connectionStats,
      eventListeners: this.eventListeners.size,
    }
  }

  testConnection() {
    if (this.isConnected && this.isAuthenticated) {
      this.sendPing()
      return true
    }
    return false
  }

  // Private methods
  scheduleReconnection() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`🔄 Scheduled reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      if (!this.isConnected && this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.socket.connect()
      }
    }, delay)
  }

  startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.isAuthenticated) {
        this.sendPing()
      }
    }, 30000) // Ping every 30 seconds
  }

  handleConnectionError(error) {
    this.connectionStats.connectionErrors++
    this.connectionStatus = 'error'
    this.emit('socket_error', {
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

// Create singleton instance
const socketService = new SocketService()
export { socketService }
export default socketService
