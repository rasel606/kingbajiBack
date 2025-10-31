const mongoose = require('mongoose');

const UserBonusSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  bonusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
  amount: { type: Number, required: true },
  remainingAmount: { type: Number },
  bonusType: {
    type: String,
    required: true,
    enum: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other','referralRebate','normalDeposit','signup','birthday']
  },
  turnoverRequirement: { type: Number, required: true },
  completedTurnover: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  
  expiryDate: { type: Date },
  transactionId: { type: String, ref: 'Transaction' },
  referredBy: { type: String },
  referredbyAgent: { type: String, ref: 'Agent' },
  referredByAffiliate: { type: String, ref: 'AffiliateModal' },
  referredbysubAdmin: { type: String, ref: 'SubAdmin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
UserBonusSchema.index({ userId: 1, status: 1 });
UserBonusSchema.index({ bonusType: 1, createdAt: 1 });

module.exports = mongoose.model('UserBonus', UserBonusSchema);