const mongoose = require('mongoose');

const AffiliateCommissionModalSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  earningsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateEarnings',
    required: true
  },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalGGR: Number,
  totalTurnover: Number,
  totalBonus: Number,
  netProfit: Number,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'paid', 'negative_carry'],
    default: 'pending'
  },
  activePlayers: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AffiliateCommissionModal', AffiliateCommissionModalSchema);