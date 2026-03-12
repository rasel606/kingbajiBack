const mongoose = require('mongoose');

const VipPointUpdateLogSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  vipPointsBefore: { type: Number, required: true },
  vipPointsAfter: { type: Number, required: true },
  levelBefore: { type: String, required: true },
  levelAfter: { type: String, required: true },
  turnover: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

VipPointUpdateLogSchema.index({ userId: 1 });

module.exports = mongoose.model('VipPointUpdateLog', VipPointUpdateLogSchema);
