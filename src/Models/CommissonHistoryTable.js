const mongoose = require('mongoose');

const bankTableSchema = new mongoose.Schema({
  contract_id: { type: String },
  staff: { type: String, required: true },
  deposit_commission: { type: String, required: true },
  withdrawal_commission: { type: String, required: true },
  withdrawal_amount: { type: String, required: true },
  image: { type: String, required: true },

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const bankTable = mongoose.model('bankTable', bankTableSchema);

module.exports = bankTable;