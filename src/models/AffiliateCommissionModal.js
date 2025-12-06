const mongoose = require('mongoose');

const AffiliateCommissionModalSchema = new mongoose.Schema({
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  referralCode: String,
  transactionId: String,
  userId: String,
  amount: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  commissionPercentage: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['bonus_cut', 'deposit', 'bet', 'net_loss', 'turnover']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  description: String,
  period: Date // The period this commission is for
}, { timestamps: true });
module.exports = mongoose.model('AffiliateCommissionModal', AffiliateCommissionModalSchema);