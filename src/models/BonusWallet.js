// const mongoose = require('mongoose');

// const bonusWalletSchema = new mongoose.Schema({
//     userId: { type: String, required: true, unique: true },
//     bonusWallet: {
//         balance: { type: Number, default: 0 },
//     },
//     bonusType: {
//         type: String,
//         required: true,
//         enum: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other', 'referralRebate', 'normalDeposit', 'signup', 'birthday']
//     },
//     provider: { type: String, default: 'SYSTEM' },
//     amount: { type: Number, required: true },
//     wageringRequirement: { type: Number, default: 0 },
//     wageringCompleted: { type: Number, default: 0 },
//     wageringRequirementPercent: { type: Number, default: 0 },
//     wageringCompletedPercent: { type: Number, default: 0 },
//     status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'COMPLETED'], default: 'ACTIVE' },
//     locked: { type: Boolean, default: true },    // until wagering done
//     createdAt: { type: Date, default: Date.now },
//     expiresAt: { type: Date }
// }, { timestamps: true });

// // Calculate wagering percentages automatically
// bonusWalletSchema.pre('save', function(next) {
//     if (this.wageringRequirement > 0) {
//         this.wageringCompletedPercent = (this.wageringCompleted / this.wageringRequirement) * 100;
//     } else {
//         this.wageringCompletedPercent = 0;
//     }
    
//     // Unlock if wagering requirement is met
//     if (this.wageringCompleted >= this.wageringRequirement && this.wageringRequirement > 0) {
//         this.locked = false;
//         this.status = 'COMPLETED';
//     }
    
//     next();
// });

// // Create index for efficient queries
// bonusWalletSchema.index({ userId: 1, status: 1 });
// bonusWalletSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model('BonusWallet', bonusWalletSchema);



// const mongoose = require('mongoose');

// // This should be a collection of bonus entries, not a single wallet
// const bonusWalletSchema = new mongoose.Schema({
//     userId: { type: String, required: true },
//     bonusId: { type: String, unique: true }, // Unique ID for each bonus
//     bonusType: {
//         type: String,
//         required: true,
//         enum: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other', 'referralRebate', 'normalDeposit', 'signup', 'birthday']
//     },
//     provider: { type: String, default: 'SYSTEM' },
//     amount: { type: Number, required: true }, // Original bonus amount
//     balance: { type: Number, default: 0 }, // Current available balance
//     claimedAmount: { type: Number, default: 0 }, // Amount already claimed
//     wageringRequirement: { type: Number, default: 0 }, // Required turnover
//     wageringCompleted: { type: Number, default: 0 }, // Completed turnover
//     status: { 
//         type: String, 
//         enum: ['PENDING', 'ACTIVE', 'CLAIMED', 'EXPIRED', 'CANCELLED'], 
//         default: 'PENDING' 
//     },
//     locked: { type: Boolean, default: true }, // Locked until wagering met
//     expiresAt: { type: Date },
//     activatedAt: { type: Date }, // When bonus was activated
//     claimedAt: { type: Date }, // When fully claimed
//     sourceId: { type: String }, // ID of the source (deposit ID, referral ID, etc.)
//     metadata: { type: mongoose.Schema.Types.Mixed } // Additional data
// }, { 
//     timestamps: true 
// });


// module.exports = mongoose.model('BonusWallet', bonusWalletSchema);


const mongoose = require('mongoose');

const bonusWalletSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    bonusId: { type: String, unique: true }, 
    bonusType: {
        type: String,
        required: true,
        enum: [
            'deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral',
            'other', 'referralRebate', 'normalDeposit', 'signup', 'birthday'
        ]
    },
    provider: { type: String, default: 'SYSTEM' },

    amount: { type: Number, required: true },
    balance: { type: Number, default: 0 }, 
    claimedAmount: { type: Number, default: 0 }, 

    wageringRequirement: { type: Number, default: 0 },
    wageringRequirementPercent: { type: Number, default: 1 },
    wageringCompleted: { type: Number, default: 0 },
    wageringCompletedPercent: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'CLAIMED', 'EXPIRED', 'CANCELLED'],
        default: 'ACTIVE'
    },

    locked: { type: Boolean, default: false },

    expiresAt: { type: Date },
    activatedAt: { type: Date },
    claimedAt: { type: Date },

    sourceId: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('BonusWallet', bonusWalletSchema);
