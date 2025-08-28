const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const AffiliateModelSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  whatsapp: { type: String },
  password: { type: String, required: true },
  dob: { type: Date },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  status: { type: String, default: 'Active' },
  approvedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  negativeBalance: { type: Number, default: 0 },
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String,
    branch: String,
    isDefault: { type: Boolean, default: false }
  }],
  balance: { type: Number, default: 0 },
  language: { type: String, default: 'en' },
  currencyType: { type: String, default: 'BDT' },
  callingCode: { type: String, default: '880' },
  totalCommission: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  withdrawnBalance: { type: Number, default: 0 },
  activePlayers: { type: Number, default: 0 },
  totalPlayers: { type: Number, default: 0 },
  role: { type: String, default: 'Affiliate' },
  settings: {
    commissionRate: { type: Number, default: 55 }, // 55% commission
    platformFee: { type: Number, default: 20 } // 20% platform fee
  }
}, { timestamps: true });

AffiliateModelSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

AffiliateModelSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.AffiliateModel || mongoose.model('AffiliateModel', AffiliateModelSchema);