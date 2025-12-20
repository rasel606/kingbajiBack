const mongoose = require('mongoose');

const bonusClaimSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['rebate', 'referral', 'monthly_goal', 'achievement'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'credited'],
    default: 'pending'
  },
  referralBonusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralBonus'
  },
  details: {
    invitedFriends: Number,
    completedFriends: Number,
    turnoverAmount: Number,
    depositAmount: Number
  },
  transactionId: String,
  approvedBy: String,
  approvedAt: Date,
  notes: String
}, {
  timestamps: true
});

bonusClaimSchema.index({ userId: 1, status: 1 });
bonusClaimSchema.index({ createdAt: -1 });
bonusClaimSchema.index({ type: 1 });

const BonusClaim = mongoose.model('BonusClaim', bonusClaimSchema);
module.exports = BonusClaim;