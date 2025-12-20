// models/UserVip.js
const mongoose = require('mongoose');

const VIP_CONFIG = {
  Bronze: { minTurnover: 0, maxTurnover: 49999, pointsMultiplier: 1 },
  Silver: { minTurnover: 50000, maxTurnover: 99999, pointsMultiplier: 1.2 },
  Gold: { minTurnover: 100000, maxTurnover: 499999, pointsMultiplier: 1.5 },
  Diamond: { minTurnover: 500000, maxTurnover: 999999, pointsMultiplier: 1.8 },
  Elite: { minTurnover: 1000000, maxTurnover: Infinity, pointsMultiplier: 2.0 }
};

const UserVipSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true
  },
  currentLevel: { 
    type: String, 
    required: true, 
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'], 
    default: 'Bronze'
  },
  vipPoints: { 
    type: Number, 
    default: 0,
    min: 0
  },
  monthlyTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lastMonthTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lifetimeTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lastLoyaltyBonusDate: Date,
  lastLevelUpdateDate: Date,
  isLevelManual: { 
    type: Boolean, 
    default: false 
  },
  manualLevelSetBy: { // Track who set manual level
    type: String,
    default: null
  },
  manualLevelSetAt: Date,
  lastTransactionAmount: {
    type: Number, 
    default: 0
  },
  lastTransactionDate: {
    type: Date 
  },
  lastTransactionType: {
    type: String,
    enum: ['bet', 'vip_bonus', 'level_up', 'admin_adjustment'],
    default: 'bet'
  },
  adminNotes: { // For admin to add notes about manual adjustments
    type: String,
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp before saving
UserVipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate VIP level if not manually set by admin
  if (!this.isLevelManual) {
    this.calculateVipLevel();
  }
  
  next();
});

// Method to calculate VIP level based on monthly turnover
UserVipSchema.methods.calculateVipLevel = function() {
  const turnover = this.monthlyTurnover;
  let newLevel = 'Bronze';
  
  if (turnover >= VIP_CONFIG.Elite.minTurnover) {
    newLevel = 'Elite';
  } else if (turnover >= VIP_CONFIG.Diamond.minTurnover) {
    newLevel = 'Diamond';
  } else if (turnover >= VIP_CONFIG.Gold.minTurnover) {
    newLevel = 'Gold';
  } else if (turnover >= VIP_CONFIG.Silver.minTurnover) {
    newLevel = 'Silver';
  }
  
  // Check if level changed
  if (this.currentLevel !== newLevel) {
    const oldLevel = this.currentLevel;
    this.currentLevel = newLevel;
    this.lastLevelUpdateDate = new Date();
    this.lastTransactionType = 'level_up';
    
    // Calculate VIP points based on level multiplier
    this.calculateVipPoints();
    
    console.log(`VIP Level changed for user ${this.userId}: ${oldLevel} -> ${newLevel}`);
  }
};

// Method to calculate VIP points
UserVipSchema.methods.calculateVipPoints = function() {
  const config = VIP_CONFIG[this.currentLevel];
  // Base points (1 point per 1000 turnover) multiplied by level multiplier
  const basePoints = Math.floor(this.monthlyTurnover / 1000);
  this.vipPoints = Math.floor(basePoints * config.pointsMultiplier);
};

// Method to reset monthly turnover (for end of month processing)
UserVipSchema.methods.resetMonthlyTurnover = function() {
  this.lastMonthTurnover = this.monthlyTurnover;
  this.monthlyTurnover = 0;
  this.lastLevelUpdateDate = new Date();
  this.isLevelManual = false; // Reset manual flag on monthly reset
  this.manualLevelSetBy = null;
  this.manualLevelSetAt = null;
  this.adminNotes += `\nMonthly reset on ${new Date().toISOString()}. Previous turnover: ${this.lastMonthTurnover}`;
  
  // Recalculate level based on reset turnover (will be Bronze)
  this.calculateVipLevel();
};

// Method for admin to manually set level
UserVipSchema.methods.setManualLevel = function(level, adminId, notes = '') {
  if (!['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'].includes(level)) {
    throw new Error('Invalid VIP level');
  }
  
  this.currentLevel = level;
  this.isLevelManual = true;
  this.manualLevelSetBy = adminId;
  this.manualLevelSetAt = new Date();
  this.adminNotes += `\nManual level set to ${level} by ${adminId} at ${this.manualLevelSetAt}. Notes: ${notes}`;
  this.lastLevelUpdateDate = new Date();
  this.lastTransactionType = 'admin_adjustment';
  
  // Recalculate points for the manually set level
  this.calculateVipPoints();
};

// Method to add turnover (used in betting job)
UserVipSchema.methods.addTurnover = function(amount, transactionType = 'bet') {
  this.monthlyTurnover += amount;
  this.lifetimeTurnover += amount;
  this.lastTransactionAmount = amount;
  this.lastTransactionDate = new Date();
  this.lastTransactionType = transactionType;
  
  // Only auto-calculate if not manually set
  if (!this.isLevelManual) {
    this.calculateVipLevel();
  }
};

// Static method to get VIP level by turnover
UserVipSchema.statics.getLevelByTurnover = function(turnover) {
  if (turnover >= VIP_CONFIG.Elite.minTurnover) return 'Elite';
  if (turnover >= VIP_CONFIG.Diamond.minTurnover) return 'Diamond';
  if (turnover >= VIP_CONFIG.Gold.minTurnover) return 'Gold';
  if (turnover >= VIP_CONFIG.Silver.minTurnover) return 'Silver';
  return 'Bronze';
};

// Static method for bulk monthly reset
UserVipSchema.statics.resetAllMonthlyTurnovers = async function() {
  const result = await this.updateMany(
    {},
    {
      $set: {
        lastMonthTurnover: '$monthlyTurnover',
        monthlyTurnover: 0,
        lastLevelUpdateDate: new Date(),
        isLevelManual: false,
        manualLevelSetBy: null,
        manualLevelSetAt: null
      },
      $push: {
        adminNotes: `Monthly reset on ${new Date().toISOString()}`
      }
    }
  );
  
  return result;
};

// Add indexes
UserVipSchema.index({ monthlyTurnover: -1 });
UserVipSchema.index({ lifetimeTurnover: -1 });
UserVipSchema.index({ vipPoints: -1 });
UserVipSchema.index({ currentLevel: 1 });
UserVipSchema.index({ isLevelManual: 1 });

module.exports = mongoose.model('UserVip', UserVipSchema);
module.exports.VIP_CONFIG = VIP_CONFIG;