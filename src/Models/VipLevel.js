const mongoose = require('mongoose');

const VipLevelSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'] },
  monthlyTurnoverRequirement: { type: Number, required: true },
  vpConversionRate: { type: Number, required: true }, // Turnover needed for 1 VP
  loyaltyBonusPercentage: { type: Number, required: true }, // Percentage of turnover as bonus
  benefits: [String],
  isInvitationOnly: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VipLevel = mongoose.model('VipLevel', VipLevelSchema);
module.exports = VipLevel;