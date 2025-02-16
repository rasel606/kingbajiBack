const mongoose = require('mongoose');

const BetProviderTableSchema = new mongoose.Schema({
  company: { type: String },
  name: { type: String },
  url: { type: String},
  image_url: { type: String},
  login_url: { type: String },
  username: { type: String},
  password: { type: String},
  providercode: { type: String},
  operatorcode: { type: String },
  key: { type: String },
  auth_pass: { type: String},
  id_active: { type: Boolean, default: true },
  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const BetProviderTable = mongoose.model('BetProviderTable', BetProviderTableSchema);

module.exports = BetProviderTable;