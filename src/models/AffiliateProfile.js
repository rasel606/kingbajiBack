// models/Profile.js
const mongoose = require('mongoose');

const AffiliateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateModel',
    required: true
  },
  contactInfo: {
    phone1: {
      number: String,
      verified: { type: Boolean, default: false },
      callingCode: { type: String, default: '+1' }
    },
    phone2: {
      number: String,
      verified: { type: Boolean, default: false },
      callingCode: String
    },
    phone3: {
      number: String,
      verified: { type: Boolean, default: false },
      callingCode: String
    },
    email: {
      address: String,
      verified: { type: Boolean, default: false }
    },
    whatsapp: {
      number: String,
      verified: { type: Boolean, default: false },
      callingCode: String
    },
    telegram: String,
    skype: String,
    wechat: String
  },
  earnings: {
    ggr: { type: Number, default: 0 },
    jackpotCost: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    turnover: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    recycleBalance: { type: Number, default: 0 },
    cancelFee: { type: Number, default: 0 },
    vipCashBonus: { type: Number, default: 0 },
    revenueAdjustment: { type: Number, default: 0 },
    referralCommission: { type: Number, default: 0 },
    paymentFee: { type: Number, default: 0 },
    negativeProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    commissionPercent: { type: Number, default: 0 },
    potentialAmount: { type: Number, default: 0 }
  },
  commission: {
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    processing: { type: Number, default: 0 }
  },
  bankDetails: [{
    bankName: String,
    accountName: String,
    accountNumber: String,
    branch: String,
    currency: { type: String, default: 'BDT' },
    isPrimary: { type: Boolean, default: false }
  }],
  identityDocuments: {
    driversLicense: {
      number: String,
      image: String,
      verified: { type: Boolean, default: false }
    },
    nationalId: {
      number: String,
      image: String,
      verified: { type: Boolean, default: false }
    },
    passport: {
      number: String,
      image: String,
      verified: { type: Boolean, default: false }
    }
  },
  lastWithdrawalTime: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('AffiliateProfile', AffiliateProfileSchema);