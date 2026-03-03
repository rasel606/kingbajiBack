const mongoose = require('mongoose');

const bankTableSchema = new mongoose.Schema({
  group_id: { type: String },
  _customer_id: { type: String, required: true },
  group_name: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const bankTable = mongoose.model('bankTable', bankTableSchema);

module.exports = bankTable;