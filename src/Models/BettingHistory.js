const mongoose = require('mongoose');

const bettingHistorySchema = new mongoose.Schema({
  ref_no: { type: String, required: true, unique: true },
  site: { type: String, required: true },
  product: { type: String, required: true },
  member: { type: String, required: true },
  game_id: { type: String, required: true },
  start_time: { type: Date, required: true },
  match_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  bet_detail: { type: String, required: true },
  turnover: { type: Number, required: true },
  bet: { type: Number, required: true },
  payout: { type: Number, required: true },
  commission: { type: Number, required: true },
  p_share: { type: Number, required: true },
  p_win: { type: Number, required: true },
  status: { type: Number },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const BettingHistory = mongoose.model('BettingHistory', bettingHistorySchema);
module.exports = BettingHistory;