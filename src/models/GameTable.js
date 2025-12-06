const mongoose = require('mongoose');

const GameTableSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  agentId: {
    type: String,
    required: true
  },
  gameId: {
    type: String,
    required: true
  },
  currencyId: {
    type: String,
    default: 'USD'
  },
  betAmount: {
    type: Number,
    required: true
  },
  winAmount: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    required: true
  },
  returnId: {
    type: String
  },
  status: {
    type: Number,
    default: 0 // 0: pending, 1: win, 2: loss
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatetimestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameTable', GameTableSchema);