const mongoose = require('mongoose');

const GameTypeSchema = new mongoose.Schema({
  name: String,
  profitLoss: { type: Number, default: 0 },
  turnover: { type: Number, default: 0 }
}, { _id: false });

const AffiliateUserdailyEarningSchema = new mongoose.Schema({
  affiliateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affiliate', 
    required: true 
  },

  todayTotalProfitLoss: { type: Number, default: 0 },
  todayJackpot: { type: Number, default: 0 },
  todayDeduction: { type: Number, default: 0 },
  todayTurnover: { type: Number, default: 0 },
  todayBonus: { type: Number, default: 0 }, // Sum of all bonuses
  todaydepositBonus: { type: Number, default: 0 }, // Deposit bonuses
  todayOtherBonus: { type: Number, default: 0 }, // Other bonuses
  todayRecycleBalance: { type: Number, default: 0 },
  todayCancelFee: { type: Number, default: 0 },
  todayVipCashBonus: { type: Number, default: 0 },
  revenueAdjustment: { type: Number, default: 0 },
  // referralCommission: { type: Number, default: 0 },

  gameTypes: [GameTypeSchema],

  updatedAtTodayDate: { type: Date }
}, { timestamps: true });

// Normalize period to the 1st of the month
AffiliateUserdailyEarningSchema.pre('save', function(next) {
  this.period.setUTCHours(0, 0, 0, 0);
  this.period.setUTCDate(1);
  next();
});

// Indexes
AffiliateUserdailyEarningSchema.index({ affiliateId: 1}, { unique: true });

module.exports = mongoose.model('AffiliateUserdailyEarning', AffiliateUserdailyEarningSchema);