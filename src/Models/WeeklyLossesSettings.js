const mongoose = require('mongoose');

const WeeklyLossesSettingsSchema = new mongoose.Schema({
  name: { type: String },
  minTurnover: { type: Number, required: true }, // ex: 300
  maxTurnover: { type: Number, required: true }, // ex: 600
  rebatePercentage: { type: Number, required: true }, // 1.4 for 1.4%
  TurnoverPercentage: { type: Number, required: true },
  active: { type: Boolean, default: true },
  sessionStart: { type: String, required: true }, // e.g. "00:40"
  sessionEnd: { type: String, required: true }, // e.g. "01:00"
  createdAt: { type: Date, default: Date.now }
});

const RebateSetting = mongoose.model('WeeklyLossesSettings', WeeklyLossesSettingsSchema);
module.exports = RebateSetting