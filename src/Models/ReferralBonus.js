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
  referredBy: {
    type: String
  },
  wageringRequirement: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'credited', 'cancelled'],
    default: 'pending'
  },
  creditedAt: Date
}, {
  timestamps: true
});

referralBonusSchema.index({ userId: 1, referredUser: 1 }, { unique: true });
referralBonusSchema.index({ level: 1 });
referralBonusSchema.index({ status: 1 });

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);