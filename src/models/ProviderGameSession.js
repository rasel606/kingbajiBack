const mongoose = require('mongoose');

/**
 * Provider Game Session Model
 * প্রতিটি game session এর তথ্য রাখে
 */
const providerGameSessionSchema = new mongoose.Schema({
  // Session Info
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
    ref: 'User',
  },
  
  // Provider Info
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ThirdPartyProvider',
    index: true,
  },
  providerCode: {
    type: String,
    required: true,
  },
  
  // Game Info
  gameId: {
    type: String,
    required: true,
    index: true,
  },
  gameName: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    enum: ['SLOT', 'LIVE_CASINO', 'SPORTS', 'FISHING', 'LOTTERY', 'ARCADE', 'TABLE_GAMES'],
  },
  
  // Session Details
  gameUrl: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    select: false,
  },
  
  // Session Status
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'TERMINATED'],
    default: 'ACTIVE',
    index: true,
  },
  
  // Financial Data
  initialBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  totalBet: {
    type: Number,
    default: 0,
  },
  totalWin: {
    type: Number,
    default: 0,
  },
  totalLoss: {
    type: Number,
    default: 0,
  },
  
  // Bonus Usage
  bonusUsed: {
    type: Number,
    default: 0,
  },
  bonusWon: {
    type: Number,
    default: 0,
  },
  
  // Device Info
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['DESKTOP', 'MOBILE', 'TABLET'],
    },
    platform: {
      type: String,
      enum: ['WEB', 'IOS', 'ANDROID'],
    },
  },
  
  // Timestamps
  startTime: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endTime: {
    type: Date,
    index: true,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  
  // Session Duration (in seconds)
  duration: {
    type: Number,
    default: 0,
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
providerGameSessionSchema.index({ userId: 1, status: 1, startTime: -1 });
providerGameSessionSchema.index({ providerId: 1, status: 1 });
providerGameSessionSchema.index({ gameId: 1, startTime: -1 });
providerGameSessionSchema.index({ status: 1, lastActivityAt: 1 });

// Virtuals
providerGameSessionSchema.virtual('netProfit').get(function() {
  return this.totalWin - this.totalBet;
});

providerGameSessionSchema.virtual('isActive').get(function() {
  return this.status === 'ACTIVE';
});

// Methods
providerGameSessionSchema.methods.updateBalance = function(betAmount, winAmount) {
  this.totalBet += betAmount;
  this.totalWin += winAmount;
  this.currentBalance = this.currentBalance - betAmount + winAmount;
  this.totalLoss = this.totalBet - this.totalWin;
  this.lastActivityAt = new Date();
  return this.save();
};

providerGameSessionSchema.methods.endSession = function() {
  this.status = 'COMPLETED';
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  return this.save();
};

providerGameSessionSchema.methods.checkExpiry = function(expiryMinutes = 30) {
  const now = new Date();
  const diff = (now - this.lastActivityAt) / 1000 / 60;
  
  if (diff > expiryMinutes && this.status === 'ACTIVE') {
    this.status = 'EXPIRED';
    this.endTime = new Date();
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
    return this.save();
  }
  return null;
};

// Static Methods
providerGameSessionSchema.statics.getActiveSessions = function(userId) {
  return this.find({
    userId,
    status: 'ACTIVE',
  }).sort({ startTime: -1 });
};

providerGameSessionSchema.statics.getUserSessionStats = function(userId, startDate, endDate) {
  const match = {
    userId,
    startTime: { $gte: startDate, $lte: endDate },
  };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalBet: { $sum: '$totalBet' },
        totalWin: { $sum: '$totalWin' },
        totalLoss: { $sum: '$totalLoss' },
        avgSessionDuration: { $avg: '$duration' },
        totalBonusUsed: { $sum: '$bonusUsed' },
      },
    },
  ]);
};

module.exports = mongoose.model('ProviderGameSession', providerGameSessionSchema);
