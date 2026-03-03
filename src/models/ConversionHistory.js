const mongoose = require('mongoose');

const ConversionHistorySchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  vpAmount: { type: Number, required: true },
  moneyAmount: { type: Number, required: true },
  conversionRate: { type: Number, required: true }, // VP per money unit
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConversionHistory', ConversionHistorySchema);