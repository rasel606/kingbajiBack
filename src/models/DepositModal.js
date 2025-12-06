const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  deposit_id: { type: String, required: true, unique: true },
  deposit_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionID: { type: String, required: true, unique: true },
  base_amount: { type: Number, required: true },
  USD: { type: Number, required: true },
  currency_rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  gateway: { type: Number, enum: [0, 1, 2, 3], required: true }, // 0 = Agent, 1 = Online, 2 = Token, 3 = Bank
  getway_name: { type: String, required: true },
  contact_id: { type: String, required: true },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  mobile: { type: String },
  payment_method_number: { type: String },
  remark: { type: String },
  status: { type: Number, enum: [0, 1, 2], default: 0 }, // 0 = Hold, 1 = Accept, 2 = Reject
  datetime: { type: Date, default: Date.now },
  is_commission: { type: Boolean, default: false }
});

module.exports = mongoose.model('Deposit', DepositSchema);
