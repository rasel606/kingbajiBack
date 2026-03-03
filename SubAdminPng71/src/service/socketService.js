// services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupDefaultListeners();

    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  emit(event, data) {
    if (!this.socket || !this.connected) {
      console.warn('Socket not connected. Event not emitted:', event);
      return false;
    }
    
    this.socket.emit(event, data);
    return true;
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Chat specific methods
  joinChatRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  leaveChatRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  sendChatMessage(roomId, message) {
    this.emit('chat_message', { roomId, message });
  }

  onChatMessage(callback) {
    this.on('chat_message', callback);
  }

  // Notification methods
  onNotification(callback) {
    this.on('notification', callback);
  }

  // Real-time updates
  onTransactionUpdate(callback) {
    this.on('transaction_update', callback);
  }

  onUserUpdate(callback) {
    this.on('user_update', callback);
  }

  onDashboardUpdate(callback) {
    this.on('dashboard_update', callback);
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export { socketService };
