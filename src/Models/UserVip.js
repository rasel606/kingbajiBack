const mongoose = require('mongoose');

const UserVipSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  currentLevel: { type: String, required: true, enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'], default: 'Bronze' },
  vipPoints: { type: Number, default: 0 },
  monthlyTurnover: { type: Number, default: 0 },
  lastMonthTurnover: { type: Number, default: 0 },
  lifetimeTurnover: { type: Number, default: 0 },
  lastLoyaltyBonusDate: Date,
  lastLevelUpdateDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserVip = mongoose.model('UserVip', UserVipSchema);
module.exports = UserVip;