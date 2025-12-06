const { ref } = require("joi");
const mongoose = require("mongoose");

const TurnOverModalSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  tier: { type: Number, enum: [1, 2, 3] },
  isClaimed: { type: Boolean, default: false },
  earnedAt: { type: Date, default: Date.now },
  turnoverAmount: { type: Number, required: true },
  rewardPercent: Number,
  rewardAmount: Number,
  type: { type: String, default: ["referralBonus","bettingturnover","bonus"] },
  CreatedDate: { type: Date, default: Date.now },
  is_commission: { type: Boolean, default: false },
  referredbyAgent: { type: String, ref: 'Agent', default: null },
  // : { type: String, ref: 'AffiliateUser', default: null },
  referredbysubAdmin: { type: String, ref: 'SubAdmin', default: null },
  timestamp: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  game_id: [
    {
      game_id: { type: String, ref: 'BettingHistory' },
      turnover: { type: String, ref: 'BettingHistory' },
      bet: { type: String, ref: 'BettingHistory' },
      payout: { type: String, ref: 'BettingHistory' },
  }
]
  
});
const TurnOverModal = mongoose.model("TurnOverModal", TurnOverModalSchema);
module.exports = TurnOverModal;