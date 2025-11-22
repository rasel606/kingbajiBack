// models/Withdrawal.js
const mongoose = require('mongoose');

const AffiliateWithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['bank', 'player'],
    required: true
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  playerInfo: {
    playerId: String,
    playerName: String
  },
  processedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('AffiliateWithdrawal', AffiliateWithdrawalSchema);