const mongoose = require('mongoose');

const bankTableSchema = new mongoose.Schema({
  name: { type: String },
  acc_name: { type: String, required: true },
  acc_number: { type: String, required: true },
  userId: { type: String, required: true },
  contact_id: { type: String, required: true },
  staff_id: { type: String, unique: true },
  currency_id: { type: String, unique: true },
  image: { type: String, unique: true },
  isActive: { type: String, unique: true },
  startTime: { type: String, unique: true },
  endTime: { type: String, unique: true },
  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const bankTable = mongoose.model('bankTable', bankTableSchema);

module.exports = bankTable;