const e = require('express');
const mongoose = require('mongoose');

const BetPromotionTableSchema = new mongoose.Schema({
  image: { type: String },
  title: { type: String},
  description: { type: String},
  link: { type: String},
  currency_id: { type: String },
  is_active: { type: Boolean, default: true },
  rules: { type: String},
  is_active_rules: { type: Boolean, default: true },
  start_time: { type: String},
  end_time: { type: String},
  start_date: { type: String},
  end_date: { type: String},
  is_active_date: { type: Boolean, default: true },
  TakeTime:[{type: String}],

  

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const BetPromotionTable = mongoose.model('BetPromotionTable', BetPromotionTableSchema);

module.exports = BetPromotionTable;