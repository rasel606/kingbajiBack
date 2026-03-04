// import { apiService } from './api';
// import { authService } from './authService';

// class LiveChatService {
//   constructor() {
//     this.API_BASE_URL = 'https://api.png71.live/api';
//   }

//   ensureAuth() {
//     const token = localStorage.getItem('admin_sub_token');
//     if (!token) throw new Error('User not authenticated');
//     return token;
//   }

//   // -------------------- User Methods --------------------
//   async startChat(message) {
//     return apiService.post('/live-chat/user/start-chat', { message });
//   }

//   async userSendMessage(roomId, message) {
//     return apiService.post('/live-chat/user/send-message', { roomId, message });
//   }

//   async getUserChatHistory(page = 1, limit = 50) {
//     return apiService.get('/live-chat/user/chat-history', { page, limit });
//   }

//   async getChatMessages(roomId) {
//     return apiService.get(`/live-chat/user/chat/${roomId}`);
//   }

//   async userCloseChat(roomId) {
//     return apiService.post('/live-chat/user/close-chat', { roomId });
//   }

//   async uploadFile(file, onProgress = null) {
//     const formData = new FormData();
//     formData.append('file', file);
//     return apiService.uploadFile('/live-chat/user/upload-file', formData, onProgress);
//   }

//   async sendMessageWithFile(roomId, message, file, onProgress = null) {
//     let attachment = null;
//     if (file) {
//       const uploadRes = await this.uploadFile(file, onProgress);
//       if (uploadRes.success) attachment = uploadRes.file;
//       else throw new Error(uploadRes.message);
//     }
//     return apiService.post('/live-chat/user/send-message', {
//       roomId,
//       message,
//       attachment,
//       messageType: file ? 'file' : 'text'
//     });
//   }

//   async markAsRead(roomId) {
//     return apiService.post('/live-chat/mark-as-read', { roomId });
//   }

//   // -------------------- Admin Methods --------------------
//   async getAdminChats(status = 'all', sortBy = 'unread', page = 1, limit = 20) {
//     const params = { page, limit, sortBy };
//     if (status !== 'all') params.status = status;
//     return apiService.get('/live-chat/admin/chats', params);
//   }

//   async assignChat(roomId) {
//     return apiService.post('/live-chat/admin/assign-chat', { roomId });
//   }

//   async adminSendMessage(roomId, message) {
//     return apiService.post('/live-chat/admin/send-message', { roomId, message });
//   }

//   async adminCloseChat(roomId) {
//     return apiService.post('/live-chat/admin/close-chat', { roomId });
//   }

//   // -------------------- Fixed Replies --------------------
//   async getFixedReplies(category = 'all', page = 1, limit = 50) {
//     const params = { page, limit };
//     if (category !== 'all') params.category = category;
//     return apiService.get('/live-chat/fixed-replies', params);
//   }

//   async createFixedReply(data) {
//     return apiService.post('/live-chat/fixed-replies', data);
//   }

//   async useFixedReply(roomId, fixedReplyId) {
//     return apiService.post('/live-chat/use-fixed-reply', { roomId, fixedReplyId });
//   }

//   async updateFixedReply(id, data) {
//     return apiService.put(`/live-chat/fixed-replies/${id}`, data);
//   }

//   async deleteFixedReply(id) {
//     return apiService.delete(`/live-chat/fixed-replies/${id}`);
//   }

//   // -------------------- Utility --------------------
//   isAuthenticated() {
//     return !!authService.init();
//   }

//   getCurrentToken() {
//     return authService.init();
//   }
// }

// export const liveChatService = new LiveChatService();




// src/service/liveChatService.js
import { apiService } from './api';
import { authService } from './authService';

class LiveChatService {
  constructor() {
    this.API_BASE_URL ='https://api.png71.live/api';
    this.uploadCallbacks = new Map();
  }

  ensureAuth() {
    const token = localStorage.getItem('admin_sub_token');
    if (!token) throw new Error('User not authenticated');
    return token;
  }

  // -------------------- User Methods --------------------
  async startChat(message) {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is required to start a chat');
    }

    return apiService.post('/live-chat/user/start-chat', { 
      message: message.trim() 
    });
  }

  async userSendMessage(roomId, message, attachment = null) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    if (!message && !attachment) {
      throw new Error('Message or attachment is required');
    }

    return apiService.post('/live-chat/user/send-message', { 
      roomId, 
      message: message ? message.trim() : '',
      attachment,
      messageType: attachment ? 'file' : 'text'
    });
  }

  async getUserChatHistory(page = 1, limit = 50, status = 'all') {
    const params = { page, limit };
    if (status !== 'all') params.status = status;
    
    return apiService.get('/live-chat/user/chat-history', params);
  }

  async getChatMessages(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.get(`/live-chat/user/chat/${roomId}`);
  }

  async userCloseChat(roomId, reason = '') {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.post('/live-chat/user/close-chat', { 
      roomId, 
      reason 
    });
  }

  async uploadFile(file, onProgress = null) {
    if (!file) {
      throw new Error('File is required');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images, PDFs, and documents are allowed.');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Store progress callback
    const uploadId = `upload_${Date.now()}`;
    if (onProgress) {
      this.uploadCallbacks.set(uploadId, onProgress);
    }

    try {
      const response = await apiService.uploadFile('/live-chat/user/upload-file', formData, (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress, uploadId);
        }
      });

      // Clean up callback
      this.uploadCallbacks.delete(uploadId);

      return response;
    } catch (error) {
      this.uploadCallbacks.delete(uploadId);
      throw error;
    }
  }

  async sendMessageWithFile(roomId, message, file, onProgress = null) {
    let attachment = null;
    
    if (file) {
      const uploadRes = await this.uploadFile(file, onProgress);
      if (uploadRes.success) {
        attachment = uploadRes.file;
      } else {
        throw new Error(uploadRes.message || 'File upload failed');
      }
    }

    return this.userSendMessage(roomId, message, attachment);
  }

  async markAsRead(roomId, messageIds = []) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.post('/live-chat/mark-as-read', { 
      roomId, 
      messageIds 
    });
  }

  // -------------------- Admin Methods --------------------
  async getAdminChats(status = 'all', sortBy = 'unread', page = 1, limit = 20, search = '') {
    const params = { page, limit, sortBy };
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    
    return apiService.get('/live-chat/admin/chats', params);
  }

  async assignChat(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.post('/live-chat/admin/assign-chat', { roomId });
  }

  async adminSendMessage(roomId, message, messageType = 'text') {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    if (!message) {
      throw new Error('Message is required');
    }

    return apiService.post('/live-chat/admin/send-message', { 
      roomId, 
      message: message.trim(),
      messageType
    });
  }

  async adminCloseChat(roomId, reason = '') {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.post('/live-chat/admin/close-chat', { 
      roomId, 
      reason 
    });
  }

  // -------------------- Fixed Replies --------------------
  async getFixedReplies(category = 'all', page = 1, limit = 50, search = '') {
    const params = { page, limit };
    if (category !== 'all') params.category = category;
    if (search) params.search = search;
    
    return apiService.get('/live-chat/fixed-replies', params);
  }

  async createFixedReply(data) {
    if (!data.title || !data.message) {
      throw new Error('Title and message are required');
    }

    return apiService.post('/live-chat/fixed-replies', {
      title: data.title.trim(),
      message: data.message.trim(),
      category: data.category || 'general'
    });
  }

  async useFixedReply(roomId, fixedReplyId) {
    if (!roomId || !fixedReplyId) {
      throw new Error('Room ID and Fixed Reply ID are required');
    }

    return apiService.post('/live-chat/use-fixed-reply', { 
      roomId, 
      fixedReplyId 
    });
  }

  async updateFixedReply(id, data) {
    if (!id) {
      throw new Error('Fixed Reply ID is required');
    }

    const updateData = {};
    if (data.title) updateData.title = data.title.trim();
    if (data.message) updateData.message = data.message.trim();
    if (data.category) updateData.category = data.category;
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

    return apiService.put(`/live-chat/fixed-replies/${id}`, updateData);
  }

  async deleteFixedReply(id) {
    if (!id) {
      throw new Error('Fixed Reply ID is required');
    }

    return apiService.delete(`/live-chat/fixed-replies/${id}`);
  }

  // -------------------- Statistics --------------------
  async getChatStats() {
    return apiService.get('/live-chat/stats');
  }

  // -------------------- Socket Health --------------------
  async getSocketHealth() {
    return apiService.get('/api/socket/health');
  }

  async getUserConnections(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return apiService.get(`/api/socket/user/${userId}`);
  }

  async getRoomInfo(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    return apiService.get(`/api/socket/room/${roomId}`);
  }

  async broadcastToRoom(roomId, event, message, data = {}) {
    if (!roomId || !event || !message) {
      throw new Error('Room ID, event, and message are required');
    }

    return apiService.post(`/api/socket/broadcast/${roomId}`, {
      event,
      message,
      data
    });
  }

  // -------------------- Utility --------------------
  isAuthenticated() {
    return !!authService.init();
  }

  getCurrentToken() {
    return authService.init();
  }

  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (message.length > 1000) {
      return { isValid: false, error: 'Message must be less than 1000 characters' };
    }

    return { isValid: true };
  }

  validateRoomId(roomId) {
    if (!roomId || !roomId.startsWith('chat_')) {
      return { isValid: false, error: 'Invalid room ID format' };
    }

    return { isValid: true };
  }

  // File utility methods
  getFileIcon(mimeType) {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType === 'text/plain') return '📃';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    return '📎';
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(mimeType) {
    return mimeType?.startsWith('image/');
  }

  // Message utility methods
  formatMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return messageTime.toLocaleDateString();
  }

  shouldShowTimeSeparator(prevMessage, currentMessage, threshold = 5 * 60 * 1000) {
    if (!prevMessage || !currentMessage) return true;
    
    const prevTime = new Date(prevMessage.timestamp);
    const currentTime = new Date(currentMessage.timestamp);
    
    return (currentTime - prevTime) > threshold;
  }

  // Cleanup
  cleanup() {
    this.uploadCallbacks.clear();
  }
}

// Create singleton instance
const liveChatService = new LiveChatService();
export { liveChatService };
export default liveChatService;