// models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  playerId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  firstDepositDate: Date,
  firstDepositAmount: Number,
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  totalBets: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

module.exports = mongoose.model('Player', playerSchema);