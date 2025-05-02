const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema({
  userId: { type: string, ref: 'User', required: true },
  referredUser: { type: string, ref: 'User', required: true },
  level: { type: Number, required: true }, // 1, 2, or 3
  amount: { type: Number, required: true },
  isClaimed: { type: Boolean, default: false },
  earnedAt: { type: Date, default: Date.now },
  claimedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);