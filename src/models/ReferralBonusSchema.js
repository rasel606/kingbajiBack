const mongoose = require('mongoose');

const ReferralBonusSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  referredUser: { type: String, required: true },
  level: { type: Number, enum: [1, 2, 3], required: true },
  
  bonusAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  
  // Commission Details
  turnover: { type: Number, default: 0 },
  commissionRate: Number,
  commissionAmount: Number,
  
  // Dates
  qualifiedAt: Date,
  paidAt: Date,
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ReferralBonus', ReferralBonusSchema);