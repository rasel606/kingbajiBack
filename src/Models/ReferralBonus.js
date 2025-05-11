const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  referredUser: { type: String, ref: 'User', required: true },
  level: { type: Number, required: true }, // 1, 2, or 3
  amount: { type: Number, required: true,default:0 },
  turnover: { type: Number, required: true,default:0 },
  isClaimed: { type: Boolean, default: false },
  earnedAt: { type: Date, default: Date.now },
  claimedAt: { type: Date },
  referredbyAgent: { type: String, ref: 'Agent',default: null },
  referredbyAffiliate: { type: String, ref: 'AffiliateUser',default: null  },
  referredbysubAdmin: { type: String, ref: 'SubAdmin',default: null  },
}, { timestamps: true });

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);