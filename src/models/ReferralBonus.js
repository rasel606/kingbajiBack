// const mongoose = require('mongoose');

// const referralBonusSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//     ref: 'User'
//   },
//   referredUser: {
//     type: String,
//     required: true,
//     ref: 'User'
//   },
//   level: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 3
//   },
//   referredBy: {
//     type: String
//   },
//   wageringRequirement: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   bonusAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'credited', 'cancelled'],
//     default: 'pending'
//   },
//   creditedAt: Date
// }, {
//   timestamps: true
// });

// referralBonusSchema.index({ userId: 1, referredUser: 1 }, { unique: true });
// referralBonusSchema.index({ level: 1 });
// referralBonusSchema.index({ status: 1 });

// module.exports = mongoose.model('ReferralBonus', referralBonusSchema);

const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  referredUser: {
    type: String,
    required: true,
    ref: 'User'
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  referralCode: String,
  bonusType: {
    type: String,
    enum: ['invitation', 'achievement', 'betting_rebate'],
    required: true
  },
  bonusAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'available', 'claimed', 'expired', 'rejected'],
    default: 'available'
  },
  wageringRequirement: {
    type: Number,
    default: 0
  },
  wageringCompleted: {
    type: Number,
    default: 0
  },
  turnoverAmount: {
    type: Number,
    default: 0
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  conditionsMet: {
    totalDeposit: { type: Boolean, default: false },
    totalTurnover: { type: Boolean, default: false },
    withinDays: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false }
  },
  metAt: Date,
  claimedAt: Date,
  expiresAt: Date,
  metadata: {
    platform: String,
    gameType: String,
    settlement: String
  }
}, {
  timestamps: true
});

referralBonusSchema.index({ userId: 1, referredUser: 1 }, { unique: true });
referralBonusSchema.index({ userId: 1, status: 1 });
referralBonusSchema.index({ level: 1 });
referralBonusSchema.index({ status: 1 });
referralBonusSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);