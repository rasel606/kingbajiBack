
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  countryCode: { type: String },
  country: { type: String },
  password: { type: String, required: true },
  birthday: { type: Date },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  referredbyAgent: { type: String },
  referredbyAffiliate: { type: String },
  referredLink: { type: String },
  levelOneReferrals: [{ type: String, ref: 'User' }],
  levelTwoReferrals: [{ type: String, ref: 'User' }],
  levelThreeReferrals: [{ type: String, ref: 'User' }],
  balance: { type: Number, default: 0 },
  cashReward: { type: Number, default: 0 },
  totalBonus: { type: Number, default: 0 },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isBirthdayVerified: { type: Boolean, default: false },
  last_game_id: { type: String },
  agentId: { type: String },
  verified: {
    email: Boolean,
    phone: Boolean
  },
  bonus: {
    name: { type: String },
    eligibleGames: [{ type: String, ref: 'Game' }],
    bonusAmount: { type: Number, default: 0 },
    wageringRequirement: { type: Number, default: 0 },// বোনাস এমাউন্ট
    isActive: { type: Boolean, default: true },
    appliedDate: { type: Date },
  },
  isActive: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now }
});
const User = mongoose.model("user", userSchema)
module.exports = User