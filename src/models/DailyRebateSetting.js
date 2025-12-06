// models/DailyRebateSetting.js
const mongoose = require("mongoose");

const DailyRebateSettingSchema = new mongoose.Schema({
  level: { type: String, required: true }, // Example: "Bronze", "Silver", "Gold"
  percentage: { type: Number, required: true }, // Rebate percentage
  minTurnover: { type: Number }, // Minimum turnover to qualify
  maxRebate: { type: Number }, // Optional cap
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DailyRebateSettingSchema.index({ level: 1 }, { unique: true });

module.exports = mongoose.model("DailyRebateSetting", DailyRebateSettingSchema);
