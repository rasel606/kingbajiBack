const mongoose = require('mongoose');

const BonusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  bonusType: { 
    type: String, 
    enum: ['deposit', 'signup', 'referral', 'turnover', 'birthday'], 
    required: true 
  },
  percentage: { type: Number }, // For percentage-based bonuses like 3% deposit
  fixedAmount: { type: Number }, // For fixed amount bonuses
  minDeposit: { type: Number, default: 200 }, // Minimum deposit to qualify
  maxBonus: { type: Number }, // Maximum bonus amount (if applicable)
  wageringRequirement: { type: Number, default: 1 }, // 1x turnover
  validDays: { type: Number, default: 7 }, // Days to complete turnover
  eligibleGames: [{ type: String }], // Game IDs or 'all'
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

 const Bonus= mongoose.model('Bonus', BonusSchema);

module.exports = Bonus