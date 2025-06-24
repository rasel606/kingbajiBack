const mongoose = require('mongoose');

const RebateLogSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  totalTurnover: { type: Number, required: true },
  rebateAmount: { type: Number, required: true },
  percentageApplied: { type: Number, required: true }, // Which % used
  date: { type: Date, required: true }, // Only Date part
  sessionStart: { type: Date, required: true },
  sessionEnd: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RebateLog = mongoose.model('RebateLog', RebateLogSchema);
module.exports = RebateLog