// src/services/websocketService.js
const WebSocket = require('ws');
const Notification = require('../Models/Notification');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws/notifications' });
    this.clients = new Map(); // userId -> WebSocket connection
    
    this.wss.on('connection', (ws, req) => {
      const userId = this.getUserIdFromRequest(req);
      
      if (userId) {
        this.clients.set(userId, ws);
        console.log(`User ${userId} connected to notifications`);
        
        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`User ${userId} disconnected from notifications`);
        });
        
        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          this.clients.delete(userId);
        });
      } else {
        ws.close(1008, 'Authentication required');
      }
    });
  }

  getUserIdFromRequest(req) {
    // Extract user ID from request (you might need to implement proper authentication)
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.pathname.split('/').pop();
  }

  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
      return true;
    }
    return false;
  }

  broadcastToUsers(userIds, notification) {
    userIds.forEach(userId => this.sendToUser(userId, notification));
  }
}

module.exports = WebSocketService;