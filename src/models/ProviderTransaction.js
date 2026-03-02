const mongoose = require('mongoose');

/**
 * Provider Transaction Model
 * সব provider transaction এর বিস্তারিত তথ্য
 */
const providerTransactionSchema = new mongoose.Schema({
  // Transaction ID
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  providerTransactionId: {
    type: String,
    required: true,
    index: true,
  },
  
  // User Info
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
  
  // Session Info
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderGameSession',
    index: true,
  },
  
  // Game Info
  gameId: {
    type: String,
    required: true,
    index: true,
  },
  gameName: {
    type: String,
  },
  gameType: {
    type: String,
    enum: ['SLOT', 'LIVE_CASINO', 'SPORTS', 'FISHING', 'LOTTERY', 'ARCADE', 'TABLE_GAMES'],
  },
  
  // Transaction Type
  transactionType: {
    type: String,
    required: true,
    enum: ['BET', 'WIN', 'REFUND', 'ROLLBACK', 'BONUS', 'JACKPOT', 'FREE_SPIN'],
    index: true,
  },
  
  // Amount Details
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'BDT',
  },
  
  // Balance Info
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  
  // Bonus Info
  bonusAmount: {
    type: Number,
    default: 0,
  },
  bonusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BonusWallet',
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'ROLLED_BACK'],
    default: 'PENDING',
    index: true,
  },
  
  // Round Info
  roundId: {
    type: String,
  },
  isRoundComplete: {
    type: Boolean,
    default: false,
  },
  
  // Request/Response Data
  requestData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  responseData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  
  // Error Info
  errorCode: {
    type: String,
  },
  errorMessage: {
    type: String,
  },
  
  // Processing Info
  processedAt: {
    type: Date,
  },
  processingTime: {
    type: Number,
  },
  
  // Rollback Info
  isRolledBack: {
    type: Boolean,
    default: false,
  },
  rollbackTransactionId: {
    type: String,
  },
  rollbackReason: {
    type: String,
  },
  
  // Device Info
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
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
providerTransactionSchema.index({ userId: 1, createdAt: -1 });
providerTransactionSchema.index({ providerId: 1, transactionType: 1, createdAt: -1 });
providerTransactionSchema.index({ gameId: 1, createdAt: -1 });
providerTransactionSchema.index({ roundId: 1 });
providerTransactionSchema.index({ status: 1, createdAt: -1 });

// Virtuals
providerTransactionSchema.virtual('isWin').get(function() {
  return this.transactionType === 'WIN' && this.amount > 0;
});

providerTransactionSchema.virtual('isBet').get(function() {
  return this.transactionType === 'BET';
});

// Methods
providerTransactionSchema.methods.markAsCompleted = function() {
  this.status = 'COMPLETED';
  this.processedAt = new Date();
  return this.save();
};

providerTransactionSchema.methods.markAsFailed = function(errorCode, errorMessage) {
  this.status = 'FAILED';
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  this.processedAt = new Date();
  return this.save();
};

providerTransactionSchema.methods.rollback = function(reason) {
  this.isRolledBack = true;
  this.rollbackReason = reason;
  this.status = 'ROLLED_BACK';
  return this.save();
};

// Static Methods
providerTransactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const { limit = 50, skip = 0, transactionType, startDate, endDate } = options;
  
  const query = { userId };
  if (transactionType) query.transactionType = transactionType;
  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('providerId', 'providerName providerCode')
    .populate('sessionId', 'gameUrl startTime');
};

providerTransactionSchema.statics.getTransactionStats = function(userId, startDate, endDate) {
  const match = {
    userId,
    status: 'COMPLETED',
    createdAt: { $gte: startDate, $lte: endDate },
  };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$transactionType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);
};

module.exports = mongoose.model('ProviderTransaction', providerTransactionSchema);
