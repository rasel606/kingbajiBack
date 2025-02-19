const mongoose = require('mongoose');

const subAdminSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  referralByCode: { type: String, min: 7, max: 7 },
  referralCode: { type: String, unique: true, min: 7, max: 7 },
  user_referredLink: { type: String, unique: true },
  agent_referredLink: { type: String, unique: true },
  affiliate_referredLink: { type: String, unique: true },
  SubAdminId: { type: String, min: 7, max: 7 },
  countryCode: { type: String},
  phone: { type: String },
  user_role: { type: String,  default: 'subAdmin' },
  users: [{ type: String, ref: 'User' }],
  Agent: [{ type: String, ref: 'Agent' }],
  Affiliate: [{ type: String, ref: 'Affiliate' }],
  IsActive: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const SubAdmin = mongoose.model('subAdmin', subAdminSchema);

module.exports = SubAdmin;
