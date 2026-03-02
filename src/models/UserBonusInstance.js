const mongoose = require('mongoose');

/**
 * User Bonus Instance Model
 * প্রতিটি user এর individual bonus instance track করে
 */
const userBonusInstanceSchema = new mongoose.Schema({
  // Instance ID
  instanceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // User Info
  userId: {
    type: String,
    required: true,
    index: true,
    ref: 'User',
  },
  
  // Bonus Configuration Reference
  bonusConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'BonusConfiguration',
    index: true,
  },
  bonusId: {
    type: String,
    required: true,
    index: true,
  },
  bonusType: {
    type: String,
    required: true,
  },
  
  // Bonus Amount
  bonusAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'BDT',
  },
  
  // Related Transaction (যদি deposit bonus হয়)
  relatedTransactionId: {
    type: String,
  },
  depositAmount: {
    type: Number,
    default: 0,
  },
  
  // Wagering Progress
  wageringRequired: {
    type: Number,
    required: true,
    default: 0,
  },
  wageringCompleted: {
    type: Number,
    default: 0,
  },
  wageringProgress: {
    type: Number,
    default: 0, // Percentage
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'ACTIVE', 'WAGERING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'FORFEITED'],
    default: 'PENDING',
    index: true,
  },
  
  // Timestamps
  claimedAt: {
    type: Date,
    default: Date.now,
  },
  activatedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  expiredAt: {
    type: Date,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Usage Tracking
  usageStats: {
    totalBets: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    totalLoss: {
      type: Number,
      default: 0,
    },
    gamesPlayed: [{
      gameId: String,
      gameName: String,
      betAmount: Number,
      winAmount: Number,
      timestamp: Date,
    }],
  },
  
  // Withdrawal Info
  withdrawalAmount: {
    type: Number,
    default: 0,
  },
  maxWithdrawalAllowed: {
    type: Number,
  },
  
  // Cancellation/Forfeiture
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: String,
  },
  cancelledAt: {
    type: Date,
  },
  
  // Free Spins (যদি free spin bonus হয়)
  freeSpins: {
    total: {
      type: Number,
      default: 0,
    },
    used: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    spinValue: {
      type: Number,
    },
    allowedGames: [{
      type: String,
    }],
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  
  // Notes
  notes: {
    type: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userBonusInstanceSchema.index({ userId: 1, status: 1, createdAt: -1 });
userBonusInstanceSchema.index({ bonusConfigId: 1, status: 1 });
userBonusInstanceSchema.index({ status: 1, expiryDate: 1 });
userBonusInstanceSchema.index({ bonusType: 1, status: 1 });

// Virtuals
userBonusInstanceSchema.virtual('isActive').get(function() {
  return this.status === 'ACTIVE' || this.status === 'WAGERING';
});

userBonusInstanceSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date() || this.status === 'EXPIRED';
});

userBonusInstanceSchema.virtual('remainingWagering').get(function() {
  return Math.max(0, this.wageringRequired - this.wageringCompleted);
});

userBonusInstanceSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Methods
userBonusInstanceSchema.methods.activate = function() {
  this.status = 'ACTIVE';
  this.activatedAt = new Date();
  return this.save();
};

userBonusInstanceSchema.methods.addWagering = function(betAmount, gameType = 'SLOT') {
  // Get contribution percentage based on game type
  const contribution = this.getGameContribution(gameType);
  const contributedAmount = betAmount * (contribution / 100);
  
  this.wageringCompleted += contributedAmount;
  this.wageringProgress = (this.wageringCompleted / this.wageringRequired) * 100;
  
  // Update status
  if (this.wageringCompleted >= this.wageringRequired) {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
  } else if (this.status === 'ACTIVE') {
    this.status = 'WAGERING';
  }
  
  return this.save();
};

userBonusInstanceSchema.methods.getGameContribution = function(gameType) {
  // Default contribution percentages
  const defaultContributions = {
    SLOT: 100,
    FISHING: 100,
    ARCADE: 100,
    LIVE_CASINO: 10,
    TABLE_GAMES: 20,
    SPORTS: 50,
    LOTTERY: 50,
  };
  
  return defaultContributions[gameType] || 0;
};

userBonusInstanceSchema.methods.useFreeSpins = function(count = 1) {
  if (this.freeSpins.remaining >= count) {
    this.freeSpins.used += count;
    this.freeSpins.remaining -= count;
    
    if (this.freeSpins.remaining === 0) {
      this.status = 'COMPLETED';
      this.completedAt = new Date();
    }
    
    return this.save();
  }
  throw new Error('Insufficient free spins');
};

userBonusInstanceSchema.methods.cancel = function(reason, cancelledBy = 'system') {
  this.status = 'CANCELLED';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

userBonusInstanceSchema.methods.forfeit = function(reason) {
  this.status = 'FORFEITED';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

userBonusInstanceSchema.methods.checkExpiry = function() {
  if (this.expiryDate < new Date() && this.status !== 'COMPLETED') {
    this.status = 'EXPIRED';
    this.expiredAt = new Date();
    return this.save();
  }
  return null;
};

// Static Methods
userBonusInstanceSchema.statics.getUserActiveBonuses = function(userId) {
  return this.find({
    userId,
    status: { $in: ['ACTIVE', 'WAGERING'] },
    expiryDate: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

userBonusInstanceSchema.statics.getUserBonusHistory = function(userId, options = {}) {
  const { limit = 50, skip = 0, status } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('bonusConfigId', 'bonusName bonusType');
};

userBonusInstanceSchema.statics.getUserBonusStats = function(userId, startDate, endDate) {
  const match = {
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$bonusAmount' },
        totalWagering: { $sum: '$wageringCompleted' },
      },
    },
  ]);
};

userBonusInstanceSchema.statics.getExpiringBonuses = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: { $in: ['ACTIVE', 'WAGERING'] },
    expiryDate: { $lte: futureDate, $gt: new Date() },
  }).populate('userId', 'username email');
};

module.exports = mongoose.model('UserBonusInstance', userBonusInstanceSchema);
