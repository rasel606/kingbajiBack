const mongoose = require('mongoose');

const BetHistoryTableSchema = new mongoose.Schema({
  bet_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  sport_id: { type: Number, required: true },
  sport_key: { type: String, required: true },
  bet_name: { type: String, required: true },
  team: { type: String, required: true },
  bet_key: { type: String, required: true },
  dollar_rate: { type: Number, required: true },
  current_dollar_rate: { type: Number, required: true },
  dollar_amount: { type: Number, required: true },
  bet_price: { type: Number, required: true },
  bet_value: { type: Number, required: true },
  total: { type: Number, required: true },
  datetime: { type: Date, required: true },
  bet_win: { type: Number, enum: [0, 1, 2], required: true }, // 0 = pending, 1 = win, 2 = loss
  type: { type: Number, enum: [0, 1], required: true } // 0 = auto, 1 = manual
});


 const BetHistoryTable = mongoose.model('BetHistoryTable', BetHistoryTableSchema);
 module.exports = BetHistoryTable;