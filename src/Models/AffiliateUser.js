const mongoose = require("mongoose");

const AffiliateUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  lastWithdrawalTime: { type: Date, default: null },
  accountStatus: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  approvedDateTime: { type: Date, required: true },
  lastLoginTime: { type: Date, default: null },
  referralCode: { type: String, required: true, unique: true },
  contactInfo: {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    whatsapp: { type: String },
  },
  earnings: {
    totalRevenue: { type: Number, default: 0.0 },
    totalProfitLoss: { type: Number, default: 0.0 },
    totalJackpot: { type: Number, default: 0.0 },
    totalDeduction: { type: Number, default: 0.0 },
    totalRevenueFromTurnover: { type: Number, default: 0.0 },
    totalBonus: { type: Number, default: 0.0 },
    totalVIPCashBonus: { type: Number, default: 0.0 },
    totalRevenueAdjustment: { type: Number, default: 0.0 },
    totalReferralCommission: { type: Number, default: 0.0 },
    totalPaymentFee: { type: Number, default: 0.0 },
    negativeCarryForward: { type: Number, default: 0.0 },
    totalNetProfit: { type: Number, default: 0.0 },
    commissionPercentage: { type: Number, default: 0 },
    earnings: { type: Number, default: 0.0 },
  },
  commission: {
    pending: { type: Number, default: 0.0 },
    available: { type: Number, default: 0.0 },
    processingWithdrawal: { type: Number, default: 0.0 },
  },
});


const AffiliateUser = mongoose.model("AffiliateUser", AffiliateUserSchema);
module.exports = AffiliateUser;