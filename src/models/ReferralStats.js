const mongoose = require('mongoose');

const referralStatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  totalInvited: {
    type: Number,
    default: 0
  },
  totalCompleted: {
    type: Number,
    default: 0
  },
  todayRebate: {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  },
  yesterdayRebate: {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  },
  pendingBonus: {
    amount: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  levelStats: {
    level1: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    level2: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    level3: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    }
  },
  monthlyAchievement: {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 5 },
    bonus: { type: Number, default: 177.00 }
  }
}, {
  timestamps: true
});

referralStatsSchema.index({ userId: 1 });

module.exports = mongoose.model('ReferralStats', referralStatsSchema);