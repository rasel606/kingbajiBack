// const mongoose = require('mongoose');

// const agentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   referralCode: { type: String, unique: true },
//   adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
//   users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   IsActive: { type: Boolean, default: true },
//   timestamp: { type: Date, default: Date.now },
//   updatetimestamp: { type: Date, default: Date.now },
// });

// const Agent = mongoose.model('Agent', agentSchema);

// module.exports = Agent;






// // Deposit History model
// const DepositHistorySchema = new mongoose.Schema({
//   deposit_user_id: mongoose.Schema.Types.ObjectId,
//   transactionID: String,
//   base_amount: Number,
//   currency_rate: Number,
//   amount: Number,
//   currency: mongoose.Schema.Types.ObjectId,
//   contact_id: mongoose.Schema.Types.ObjectId,
//   agent_id: mongoose.Schema.Types.ObjectId,
//   gateway: Number,
//   gateway_name: String,
//   status: Number,
//   remark: String,
// });

// // Withdraw History model
// const WithdrawHistorySchema = new mongoose.Schema({
//   user_id: mongoose.Schema.Types.ObjectId,
//   base_amount: Number,
//   currency_rate: Number,
//   amount: Number,
//   currency_id: mongoose.Schema.Types.ObjectId,
//   contact_id: mongoose.Schema.Types.ObjectId,
//   agent_id: mongoose.Schema.Types.ObjectId,
//   gateway: Number,
//   gateway_name: String,
//   status: Number,
//   details: String,
// });

// // Agent Details model
// const AgentDetailsSchema = new mongoose.Schema({
//   details: String,
//   type: String,
//   contact_id: mongoose.Schema.Types.ObjectId,
// });