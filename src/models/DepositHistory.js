const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the deposit schema
const depositHistorySchema = new Schema({
  deposit_id: { type: String, required: true },
  deposit_user_id: { type: String, required: true },
  transactionID: { type: String, required: true },
  base_amount: { type: Number, required: true },
  USD: { type: Number, required: true },
  currency_rate: { type: Number, required: true },
  current_currency_rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  total_amount_based_on_currency_rate: { type: Number, required: true },
  currency: { type: String, required: true },
  gateway: { 
    type: Number, 
    enum: [0, 1, 2, 3],  // 0 = Agent, 1 = Online, 2 = Token, 3 = Bank
    required: true 
  },
  gateway_name: { type: String, required: true },
  contact_id: { type: String, required: true },
  agent_id: { type: String, required: true },
  remark: { type: String, required: false },
  status: { 
    type: Number, 
    enum: [0, 1, 2],  // 0 = Hold, 1 = Accept, 2 = Reject
    required: true 
  },
  datetime: { type: Date, required: true },
  is_commission: { type: Boolean, required: true }
});

// Create the model based on the schema
const depositHistory = mongoose.model('depositHistory', depositHistorySchema);

module.exports = depositHistory;
