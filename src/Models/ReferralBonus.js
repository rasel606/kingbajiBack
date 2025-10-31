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
  status: { type: String, enum: ['pending', 'claimed'], default: 'pending' },
  // referredbyAgent: { type: String, ref: 'Agent',default: null },
  // : { type: String, ref: 'AffiliateUser',default: null  },
  // referredbysubAdmin: { type: String, ref: 'SubAdmin',default: null  },
}, { timestamps: true });
referralBonusSchema.index({ userId: 1, referredUser: 1 }, { unique: true });

const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);
module.exports = ReferralBonus;
