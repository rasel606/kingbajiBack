// // models/affiliateModel.js
// const mongoose = require('mongoose');

// const affiliateSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     firstName: String,
//     lastName: String,
//     dateOfBirth: Date,
//     lastWithdrawalTime: Date,
//     accountStatus: { type: String, default: 'Active' },
//     approvedDateTime: { type: Date, default: Date.now },
//     lastLoginTime: Date,
//     referralCode: String,
//     contactInfo: {
//         phoneNumber: String,
//         email: String,
//         whatsApp: String
//     },
//     potential: { type: Number, default: 0 },
//     earnings: {
//         totalRevenue: { type: Number, default: 0 },
//         totalProfitLoss: { type: Number, default: 0 },
//         totalJackpot: { type: Number, default: 0 },
//         totalDeduction: { type: Number, default: 0 },
//         totalBonus: { type: Number, default: 0 },
//         totalVipCashBonus: { type: Number, default: 0 },
//         totalRevenueAdjustment: { type: Number, default: 0 },
//         totalReferralCommission: { type: Number, default: 0 },
//         totalPaymentFee: { type: Number, default: 0 },
//         negativeCarryForward: { type: Number, default: 0 },
//         totalNetProfit: { type: Number, default: 0 }
//     },
//     commission: { type: Number, default: 0 },
//     earningsStatus: {
//         pending: { type: Number, default: 0 },
//         available: { type: Number, default: 0 },
//         processingWithdrawal: { type: Number, default: 0 }
//     },
//     links: [{
//         domain: String,
//         status: String,
//         keywords: String,
//         pageAction: String
//     }]
// });

// module.exports = mongoose.model('Affiliate', affiliateSchema);
