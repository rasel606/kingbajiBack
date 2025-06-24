
const mongoose = require('mongoose');



const AffiliateEarningModalSchema = new mongoose.Schema({
    totalRevenue: { type: Number, default: 0 },
    totalProfitLoss: { type: Number, default: 0 },
    totalJackpot: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    totalBonus: { type: Number, default: 0 },
    totalVipCashBonus: { type: Number, default: 0 },
    totalRevenueAdjustment: { type: Number, default: 0 },
    totalReferralCommission: { type: Number, default: 0 },
    totalPaymentFee: { type: Number, default: 0 },
    negativeCarryForward: { type: Number, default: 0 },
    totalNetProfit: { type: Number, default: 0 }
});




const AffiliateEarningModal = mongoose.model('AffiliateEarningModal', AffiliateEarningModalSchema);

module.exports = AffiliateEarningModal;