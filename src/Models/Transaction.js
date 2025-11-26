// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bonus', 'commission', 'turnover', 'recycle', 'cancel_fee', 'vip_bonus', 'referral_commission'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  period: {
    type: String,
    enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month']
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  description: String
});

module.exports = mongoose.model('Transaction', transactionSchema);