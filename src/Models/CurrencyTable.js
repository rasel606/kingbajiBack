const e = require('express');
const mongoose = require('mongoose');

const currencyTableSchema = new mongoose.Schema({
  currency_id: { type: String },
  currency_name: { type: String},
  currency_symble: { type: String},
  country: { type: String},
  country_code: { type: String },
  country_flag: { type: String },

  

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const currencyTable = mongoose.model('currencyTable', currencyTableSchema);

module.exports = currencyTable;