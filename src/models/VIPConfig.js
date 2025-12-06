const mongoose = require('mongoose');

const vipConfigSchema = new mongoose.Schema({
  levels: {
    bronze: { monthlyTurnoverRequirement: Number, vpConversionRate: Number, loyaltyBonus: Number },
    silver: { monthlyTurnoverRequirement: Number, vpConversionRate: Number, loyaltyBonus: Number },
    gold: { monthlyTurnoverRequirement: Number, vpConversionRate: Number, loyaltyBonus: Number },
    diamond: { monthlyTurnoverRequirement: Number, vpConversionRate: Number, loyaltyBonus: Number },
    elite: { monthlyTurnoverRequirement: Number, vpConversionRate: Number, loyaltyBonus: Number },
  },
  updatedAt: { type: Date, default: Date.now }
});

const VIPConfig = mongoose.model('VIPConfig', vipConfigSchema);
module.exports = VIPConfig;
