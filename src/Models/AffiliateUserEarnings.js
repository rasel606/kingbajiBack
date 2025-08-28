const mongoose = require('mongoose');

const GameTypeSchema = new mongoose.Schema({
  name: String,
  profitLoss: { type: Number, default: 0 },
  turnover: { type: Number, default: 0 }
}, { _id: false });

const AffiliateUserEarningsSchema = new mongoose.Schema({
  affiliateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affiliate', 
    required: true 
  },
  period: { type: Date, required: true }, // Start of the month
  totalProfitLoss: { type: Number, default: 0 },
  totalJackpot: { type: Number, default: 0 },
  totalDeduction: { type: Number, default: 0 },
  totalTurnover: { type: Number, default: 0 },
  totalBonus: { type: Number, default: 0 }, // Sum of all bonuses
  dailyRebate: { type: Number, default: 0 }, // Daily rebate bonuses
  weeklyBonus: { type: Number, default: 0 }, // Weekly loss bonuses
  depositBonus: { type: Number, default: 0 }, // Deposit bonuses
  otherBonus: { type: Number, default: 0 }, // Other bonuses
  recycleBalance: { type: Number, default: 0 },
  cancelFee: { type: Number, default: 0 },
  vipCashBonus: { type: Number, default: 0 },
  revenueAdjustment: { type: Number, default: 0 },
  referralCommission: { type: Number, default: 0 },
  paymentFee: { type: Number, default: 0 },
  negativeProfit: { type: Number, default: 0 }, // Negative carry forward
  netProfit: { type: Number, default: 0 }, // After all deductions
  commissionPercent: { type: Number, default: 55 }, // 55% commission
  platformFeePercent: { type: Number, default: 20 }, // 20% platform fee
  potentialAmount: { type: Number, default: 0 }, // Before platform fee
  finalCommission: { type: Number, default: 0 }, // After platform fee
  gameTypes: [GameTypeSchema],
  status: { 
    type: String, 
    enum: ['pending', 'calculated', 'paid', 'carry_forward'], 
    default: 'pending' 
  },
  paidDate: { type: Date }
}, { timestamps: true });

// Normalize period to the 1st of the month
AffiliateUserEarningsSchema.pre('save', function(next) {
  this.period.setUTCHours(0, 0, 0, 0);
  this.period.setUTCDate(1);
  next();
});

// Indexes
AffiliateUserEarningsSchema.index({ affiliateId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('AffiliateUserEarnings', AffiliateUserEarningsSchema);