const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  action: { type: String },
  amount: { type: String},
  before_balance: { type: String},
  after_balance: { type: String },
  gameId: { type: String },
  usersId: { type: String },
  settle_amount: { type: String },

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;