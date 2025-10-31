const { string } = require('joi');
const mongoose = require('mongoose');

const BonusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  bonusType: { 
    type: String, 
    enum: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other','referralRebate', 'normalDeposit','signup','birthday'], 
    required: true 
  },

  level1Percent: Number,            // e.g., 0.2
  level2Percent: Number,            // e.g., 0.07
  level3Percent: Number,            // e.g., 0.03
  img:{ type: String, },
  percentage: { type: Number }, // For percentage-based bonuses like 3% deposit
  fixedAmount: { type: Number }, // For fixed amount bonuses
  minDeposit: { type: Number }, // Minimum deposit to qualify
  maxBonus: { type: Number }, // Maximum bonus amount (if applicable)
  minTurnover: { type: Number }, // Minimum turnover to qualify
  maxTurnover: { type: Number }, // Maximum turnover to qualify
  wageringRequirement: { type: Number, default: 1 }, // 1x turnover
  validDays: { type: Number }, // Days to complete turnover
  eligibleGames:[{
    g_code: String,
    p_code: String,
    g_type: String,
  }], // Game categories
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

 const Bonus= mongoose.model('Bonus', BonusSchema);

module.exports = Bonus