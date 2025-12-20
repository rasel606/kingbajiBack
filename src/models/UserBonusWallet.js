const mongoose = require('mongoose');

// This tracks the user's aggregated bonus wallet
const userBonusWalletSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    totalBonusEarned: { 
        type: Number, 
        default: 0 
    },
    totalBonusClaimed: { 
        type: Number, 
        default: 0 
    },
    availableBalance: { 
        type: Number, 
        default: 0 
    },
    activeBonusesCount: { 
        type: Number, 
        default: 0 
    },
    lastClaimedAt: { 
        type: Date 
    },
    statistics: {
        todayClaims: { type: Number, default: 0 },
        todayBonus: { type: Number, default: 0 },
        thisWeekClaims: { type: Number, default: 0 },
        thisMonthClaims: { type: Number, default: 0 }
    },
    settings: {
        autoClaim: { type: Boolean, default: false },
        notifications: { type: Boolean, default: true }
    }
}, { 
    timestamps: true 
});

userBonusWalletSchema.index({ userId: 1 });
userBonusWalletSchema.index({ availableBalance: 1 });

// Static method to get or create wallet
userBonusWalletSchema.statics.getOrCreate = async function(userId) {
    let wallet = await this.findOne({ userId });
    if (!wallet) {
        wallet = await this.create({ userId });
    }
    return wallet;
};

module.exports = mongoose.model('UserBonusWallet', userBonusWalletSchema);