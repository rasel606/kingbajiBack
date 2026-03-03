const mongoose = require('mongoose');

const bankTableSchema = new mongoose.Schema({
  user_id: { type: String },
  company: { type: String, required: true },
  vat: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  address: { type: String, required: true },
  webkitURLebsite: { type: String, required: true },
  casinoItem_url: { type: String,   },
  is_active: { type: Boolean, default: true },

  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const bankTable = mongoose.model('bankTable', bankTableSchema);

module.exports = bankTable;