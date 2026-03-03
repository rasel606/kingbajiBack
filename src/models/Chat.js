const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  attachment: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'fixed_reply'],
    default: 'text'
  },
  fixedReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FixedReply'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,

  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    ref: 'User'
  },
  adminName: {
    type: String
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed'],
    default: 'waiting'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    trim: true
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    user: {
      type: Number,
      default: 0
    },
    admin: {
      type: Number,
      default: 0
    }
  },
  lastSeen: {
    user: Date,
    admin: Date
  },
  assignedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
chatRoomSchema.index({ userId: 1, status: 1 });
chatRoomSchema.index({ adminId: 1, status: 1 });
chatRoomSchema.index({ lastMessageTime: -1 });
chatRoomSchema.index({ roomId: 1 });

// Update last message and time before save
chatRoomSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessage = lastMessage.message || (lastMessage.attachment ? 'File attachment' : 'Message');
    this.lastMessageTime = lastMessage.timestamp;
  }
  next();
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);