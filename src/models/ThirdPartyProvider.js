const mongoose = require('mongoose');

/**
 * Third-Party Provider Model
 * এই model সব third-party gaming provider এর তথ্য রাখে
 */
const thirdPartyProviderSchema = new mongoose.Schema({
  // Provider Basic Info
  providerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  providerName: {
    type: String,
    required: true,
    trim: true,
  },
  providerCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  
  // API Configuration
  apiConfig: {
    baseUrl: {
      type: String,
      required: true,
    },
    operatorCode: {
      type: String,
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
      select: false, // Security জন্য default এ hide থাকবে
    },
    apiVersion: {
      type: String,
      default: 'v1',
    },
    timeout: {
      type: Number,
      default: 30000, // 30 seconds
    },
  },

  // Provider Type
  providerType: {
    type: String,
    required: true,
    enum: ['SLOT', 'LIVE_CASINO', 'SPORTS', 'FISHING', 'LOTTERY', 'ARCADE', 'TABLE_GAMES'],
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isTestMode: {
    type: Boolean,
    default: false,
  },

  // Features Support
  features: {
    seamlessWallet: {
      type: Boolean,
      default: true,
    },
    transferWallet: {
      type: Boolean,
      default: false,
    },
    freeSpins: {
      type: Boolean,
      default: false,
    },
    tournaments: {
      type: Boolean,
      default: false,
    },
    jackpot: {
      type: Boolean,
      default: false,
    },
  },

  // Rate Limits
  rateLimits: {
    requestsPerMinute: {
      type: Number,
      default: 60,
    },
    requestsPerHour: {
      type: Number,
      default: 1000,
    },
  },

  // Statistics
  stats: {
    totalGames: {
      type: Number,
      default: 0,
    },
    totalPlayers: {
      type: Number,
      default: 0,
    },
    totalBets: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    lastSyncAt: {
      type: Date,
    },
  },

  // Webhook Configuration
  webhookConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
    },
    secret: {
      type: String,
      select: false,
    },
    events: [{
      type: String,
      enum: ['BET', 'WIN', 'REFUND', 'BONUS', 'JACKPOT'],
    }],
  },

  // Currency Support
  supportedCurrencies: [{
    type: String,
    default: ['BDT', 'USD', 'EUR'],
  }],

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  // Timestamps
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
thirdPartyProviderSchema.index({ providerCode: 1, isActive: 1 });
thirdPartyProviderSchema.index({ providerType: 1, isActive: 1 });

// Virtual for success rate
thirdPartyProviderSchema.virtual('successRate').get(function() {
  if (this.stats.totalBets === 0) return 0;
  return ((this.stats.totalWins / this.stats.totalBets) * 100).toFixed(2);
});

// Methods
thirdPartyProviderSchema.methods.updateStats = function(betAmount, winAmount) {
  this.stats.totalBets += 1;
  if (winAmount > 0) {
    this.stats.totalWins += 1;
  }
  this.stats.lastSyncAt = new Date();
  return this.save();
};

thirdPartyProviderSchema.methods.isRateLimitExceeded = function(requestCount, timeWindow) {
  if (timeWindow === 'minute') {
    return requestCount >= this.rateLimits.requestsPerMinute;
  }
  return requestCount >= this.rateLimits.requestsPerHour;
};

module.exports = mongoose.model('ThirdPartyProvider', thirdPartyProviderSchema);
