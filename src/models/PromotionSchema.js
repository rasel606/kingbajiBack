const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    eligibleGames: { type: [String], required: true },
    // invalidGamesCancelPromo: { type: Boolean, default: true },
    bonusAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    depositBonusConditions: {
        requiredBetAmount: { type: Number, required: true }, // টার্নওভার শর্ত
        bonusReward: { type: Number, required: true }, // বোনাস এমাউন্ট
        validTime: { type: Number, required: true } // প্রোমোশনের সময়সীমা (মিলিসেকেন্ড)
    },
    rebetBonusConditions: {
        requiredBetAmount: { type: Number, required: true }, // টার্নওভার শর্ত
        bonusReward: { type: Number, required: true }, // বোনাস এমাউন্ট
        validTime: { type: Number, required: true } // প্রোমোশনের সময়সীমা (মিলিসেকেন্ড)
    },
    dailyBonusConditions: {
        requiredBetAmount: { type: Number, required: true }, // টার্নওভার শর্ত
        bonusReward: { type: Number, required: true }, // বোনাস এমাউন্ট
        validTime: { type: Number, required: true } // প্রোমোশনের সময়সীমা (মিলিসেকেন্ড)
    },
    isActive: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    updateTimestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Promotion", promotionSchema);
