const mongoose = require('mongoose');

const LoyaltyBonusLogSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    ref: 'User', 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  vipLevel: { 
    type: String, 
    required: true,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite']
  },
  forMonth: { 
    type: Date, 
    required: true 
  },
  awardedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyBonusLog', LoyaltyBonusLogSchema);