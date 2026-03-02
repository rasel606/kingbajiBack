const mongoose = require('mongoose');

/**
 * Bonus Configuration Model
 * সব ধরনের bonus এর configuration রাখে
 */
const bonusConfigurationSchema = new mongoose.Schema({
  // Bonus Basic Info
  bonusId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  bonusName: {
    type: String,
    required: true,
  },
  bonusNameBn: {
    type: String,
  },
  description: {
    type: String,
  },
  descriptionBn: {
    type: String,
  },
  
  // Bonus Type
  bonusType: {
    type: String,
    required: true,
    enum: [
      'WELCOME_BONUS',
      'FIRST_DEPOSIT',
      'RELOAD_DEPOSIT',
      'DAILY_DEPOSIT',
      'WEEKLY_DEPOSIT',
      'CASHBACK',
      'REBATE',
      'LOSS_BONUS',
      'WIN_BONUS',
      'TURNOVER_BONUS',
      'REFERRAL_BONUS',
      'VIP_BONUS',
      'LOYALTY_BONUS',
      'FREE_SPIN',
      'BIRTHDAY_BONUS',
      'SPECIAL_EVENT',
      'TOURNAMENT_PRIZE',
      'ACHIEVEMENT_BONUS',
      'DAILY_CHECK_IN',
      'LUCKY_DRAW',
      'INSTANT_REBATE',
    ],
    index: true,
  },
  
  // Bonus Category
  category: {
    type: String,
    enum: ['DEPOSIT', 'BETTING', 'LOSS', 'REFERRAL', 'VIP', 'SPECIAL'],
    index: true,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isAutomatic: {
    type: Boolean,
    default: false,
  },
  requiresClaim: {
    type: Boolean,
    default: true,
  },
  
  // Eligibility Criteria
  eligibility: {
    minVipLevel: {
      type: String,
      enum: ['COPPER', 'BRONZE', 'SILVER', 'GOLD', 'RUBY', 'SAPPHIRE', 'DIAMOND', 'EMPEROR'],
    },
    maxVipLevel: {
      type: String,
      enum: ['COPPER', 'BRONZE', 'SILVER', 'GOLD', 'RUBY', 'SAPPHIRE', 'DIAMOND', 'EMPEROR'],
    },
    minAccountAgeDays: {
      type: Number,
      default: 0,
    },
    minDepositAmount: {
      type: Number,
      default: 0,
    },
    maxDepositAmount: {
      type: Number,
    },
    minTotalDeposits: {
      type: Number,
      default: 0,
    },
    minTotalBets: {
      type: Number,
      default: 0,
    },
    minTurnover: {
      type: Number,
      default: 0,
    },
    allowedGameTypes: [{
      type: String,
      enum: ['SLOT', 'LIVE_CASINO', 'SPORTS', 'FISHING', 'LOTTERY', 'ARCADE', 'TABLE_GAMES'],
    }],
    allowedProviders: [{
      type: String,
    }],
    excludedGames: [{
      type: String,
    }],
    requiresKYC: {
      type: Boolean,
      default: false,
    },
    requiresPhoneVerification: {
      type: Boolean,
      default: false,
    },
    requiresEmailVerification: {
      type: Boolean,
      default: false,
    },
    requiresReferral: {
      type: Boolean,
      default: false,
    },
  },
  
  // Bonus Amount Configuration
  amountConfig: {
    type: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE', 'TIERED'],
      default: 'PERCENTAGE',
    },
    fixedAmount: {
      type: Number,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 1000,
    },
    minBonusAmount: {
      type: Number,
      default: 0,
    },
    maxBonusAmount: {
      type: Number,
    },
    tiers: [{
      minAmount: Number,
      maxAmount: Number,
      bonusPercentage: Number,
      fixedBonus: Number,
    }],
  },
  
  // Wagering Requirements
  wageringRequirements: {
    multiplier: {
      type: Number,
      default: 1,
    },
    includeDeposit: {
      type: Boolean,
      default: false,
    },
    maxBetAmount: {
      type: Number,
    },
    allowedGames: [{
      type: String,
    }],
    gameContribution: {
      type: Map,
      of: Number,
    },
  },
  
  // Time Restrictions
  timeRestrictions: {
    validityDays: {
      type: Number,
      default: 7,
    },
    validityHours: {
      type: Number,
    },
    claimStartDate: {
      type: Date,
    },
    claimEndDate: {
      type: Date,
    },
    allowedDays: [{
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    }],
    allowedHoursStart: {
      type: Number,
    },
    allowedHoursEnd: {
      type: Number,
    },
  },
  
  // Claim Limits
  claimLimits: {
    maxClaimsPerUser: {
      type: Number,
      default: 1,
    },
    maxClaimsPerDay: {
      type: Number,
    },
    maxClaimsPerWeek: {
      type: Number,
    },
    maxClaimsPerMonth: {
      type: Number,
    },
    cooldownHours: {
      type: Number,
    },
  },
  
  // Withdrawal Restrictions
  withdrawalRestrictions: {
    maxWithdrawalAmount: {
      type: Number,
    },
    requiresWageringComplete: {
      type: Boolean,
      default: true,
    },
    minBalanceAfterWithdrawal: {
      type: Number,
      default: 0,
    },
  },
  
  // Special Conditions
  specialConditions: {
    cashbackPercentage: {
      type: Number,
    },
    cashbackOnLossOnly: {
      type: Boolean,
      default: true,
    },
    rebatePercentage: {
      type: Number,
    },
    rebateCalculationPeriod: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    },
    freeSpinCount: {
      type: Number,
    },
    freeSpinValue: {
      type: Number,
    },
    freeSpinGames: [{
      type: String,
    }],
    referrerBonus: {
      type: Number,
    },
    refereeBonus: {
      type: Number,
    },
    referralTiers: [{
      level: Number,
      bonusAmount: Number,
      requiredReferrals: Number,
    }],
  },
  
  // Priority
  priority: {
    type: Number,
    default: 0,
  },
  
  // Statistics
  stats: {
    totalClaimed: {
      type: Number,
      default: 0,
    },
    totalAwarded: {
      type: Number,
      default: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
    totalExpired: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
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
bonusConfigurationSchema.index({ bonusType: 1, isActive: 1 });
bonusConfigurationSchema.index({ category: 1, isActive: 1 });
bonusConfigurationSchema.index({ priority: -1 });

// Methods
bonusConfigurationSchema.methods.isEligible = function(user, depositAmount = 0) {
  const { eligibility } = this;
  
  // Check VIP Level
  if (eligibility.minVipLevel && user.vipLevel < eligibility.minVipLevel) {
    return { eligible: false, reason: 'VIP level too low' };
  }
  
  // Check Deposit Amount
  if (depositAmount > 0) {
    if (depositAmount < eligibility.minDepositAmount) {
      return { eligible: false, reason: 'Deposit amount too low' };
    }
    if (eligibility.maxDepositAmount && depositAmount > eligibility.maxDepositAmount) {
      return { eligible: false, reason: 'Deposit amount too high' };
    }
  }
  
  // Check KYC
  if (eligibility.requiresKYC && !user.isKYCVerified) {
    return { eligible: false, reason: 'KYC verification required' };
  }
  
  return { eligible: true };
};

bonusConfigurationSchema.methods.calculateBonusAmount = function(baseAmount) {
  const { amountConfig } = this;
  
  let bonusAmount = 0;
  
  if (amountConfig.type === 'FIXED') {
    bonusAmount = amountConfig.fixedAmount || 0;
  } else if (amountConfig.type === 'PERCENTAGE') {
    bonusAmount = (baseAmount * amountConfig.percentage) / 100;
  } else if (amountConfig.type === 'TIERED') {
    const tier = amountConfig.tiers.find(t => 
      baseAmount >= t.minAmount && baseAmount <= t.maxAmount
    );
    if (tier) {
      bonusAmount = tier.fixedBonus || (baseAmount * tier.bonusPercentage) / 100;
    }
  }
  
  // Apply min/max limits
  if (amountConfig.minBonusAmount && bonusAmount < amountConfig.minBonusAmount) {
    bonusAmount = amountConfig.minBonusAmount;
  }
  if (amountConfig.maxBonusAmount && bonusAmount > amountConfig.maxBonusAmount) {
    bonusAmount = amountConfig.maxBonusAmount;
  }
  
  return bonusAmount;
};

bonusConfigurationSchema.methods.updateStats = function(action, amount = 0) {
  if (action === 'claimed') this.stats.totalClaimed += 1;
  if (action === 'awarded') {
    this.stats.totalAwarded += 1;
    this.stats.totalAmount += amount;
  }
  if (action === 'completed') this.stats.totalCompleted += 1;
  if (action === 'expired') this.stats.totalExpired += 1;
  
  return this.save();
};

module.exports = mongoose.model('BonusConfiguration', bonusConfigurationSchema);
