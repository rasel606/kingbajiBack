const mongoose = require('mongoose');

const gameTableSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  agentId: { type: String, required: true },
  gameId: { type: String, required: true },
  transactionId: { type: String, required: true },
  currencyId: { type: String },
  status: { type: Number, enum: [0,1,2] },
  betAmount: { type: Number },
  winAmount: { type: Number },
  returnId: { type: String },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const gameTable = mongoose.model('gameTable', gameTableSchema);

module.exports = gameTable; 
