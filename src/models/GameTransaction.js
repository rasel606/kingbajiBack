// models/Transaction.js
const mongoose = require('mongoose');

const GameTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  reference: {
    type: String
  },
  description: {
    type: String
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  providerTransactionId: {
    type: String
  },
  balanceBefore: {
    type: Number
  },
  balanceAfter: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

GameTransactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('GameTransaction', GameTransactionSchema);