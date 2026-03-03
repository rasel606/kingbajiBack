// models/Commission.js
const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  period: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  totalCommission: {
    type: Number,
    default: 0
  },
  activePlayers: {
    type: Number,
    default: 0
  },
  registeredPlayers: {
    type: Number,
    default: 0
  },
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  totalTurnover: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'calculated', 'paid'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Commission', commissionSchema);