
const mongoose = require("mongoose");

function arrayLimit(val) {
    return val.length <= 3;
}

const phoneSchema = new mongoose.Schema({
    countryCode: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: v => /^\d{10,15}$/.test(v),
            message: props => `${props.value} সঠিক মোবাইল নম্বর নয়!`
        }
    },
    isDefault: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    verificationCode: String,
    verificationExpiry: Date
});

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    name: {
        type: String,
        trim: true,
        maxlength: 100
    },

    isNameVerified: {
        type: Boolean,
        default: false
    },
    // Email সম্পূর্ণ optional - no validation, no unique
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: false
        // No unique, no sparse - let it be completely free
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: [phoneSchema],
        validate: [arrayLimit, "৩টির বেশি মোবাইল নম্বর দেওয়া যাবে না"]
    },
    apiVerified: { type: Boolean, default: false },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    country: String,
    countryCode: String,
    balance: { type: Number, default: 0, min: 0 },
    cashReward: { type: Number, default: 0, min: 0 },
    totalBonus: { type: Number, default: 0, min: 0 },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "agent"]
    },
    isActive: { type: Boolean, default: true },
    isVerified: {
        email: { type: Boolean, default: false },
        phone: { type: Boolean, default: false }
    },

    // Login tracking
    lastLoginTime: { type: Date, default: Date.now },
    lastLoginIp: { type: String, default: "0.0.0.0" },

    // Referral system
    levelOneReferrals: [{ type: String, ref: 'User' }],
    levelTwoReferrals: [{ type: String, ref: 'User' }],
    levelThreeReferrals: [{ type: String, ref: 'User' }],
    referredBy: { type: String, ref: 'User', default: "1" },

    // User profile
    vipPoints: { type: Number, default: 0, min: 0 },
    birthday: { type: Date },
    isBirthdayVerified: {
        type: Boolean,
        default: false
    },

    // Gaming data
    last_game_id: { type: String },
    agentId: { type: String },
    lastBetTime: { type: Date },
    lastDepositTime: { type: Date },

    // Timestamps
    timestamp: { type: Date, default: Date.now },
    onlinestatus: { type: Date, default: Date.now },
    updatetimestamp: { type: Date, default: Date.now },

    // Bonus system
    bonus: {
        name: String,
        eligibleGames: [{ type: String, ref: "Game" }],
        bonusAmount: { type: Number, default: 0 },
        wageringRequirement: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        appliedDate: Date
    },



    // Session Management
    currentSession: {
        token: { type: String },
        deviceId: { type: String },
        loginTime: { type: Date },
        userAgent: { type: String },
        ipAddress: { type: String }
    },
    isLoggedIn: { type: Boolean, default: false },
    loginHistory: [{
        deviceId: String,
        userAgent: String,
        ipAddress: String,
        loginTime: Date,
        logoutTime: Date
    }],

    // Status & Activity
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Suspended'] },
    lastLogin: { type: Date },
    lastActivity: { type: Date },

    // Financials


    // Security
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    twoFactorBackupCodes: [{
        code: String,
        used: { type: Boolean, default: false },
        usedAt: Date
    }],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    securityQuestions: [{
        question: String,
        answer: String
    }]


}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.resetCode;
            delete ret.resetExpiry;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual for locked status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = userSchema;



























// const mongoose = require("mongoose");
// const phoneSchema = require("./phoneSchema");
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");

// function arrayLimit(val) {
//     return val.length <= 3;
// }

// const userSchema = new mongoose.Schema({
//     userId: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//         minlength: 3,
//         maxlength: 50
//     },
//     name: {
//         type: String,
//         trim: true,
//         maxlength: 100
//     },
//     isNameVerified: {
//         type: Boolean,
//         default: false
//     },
//     email: {
//         type: String,
//         lowercase: true,
//         trim: true,
//         required: false
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6
//     },
//     passwordChangedAt: Date,
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     phone: {
//         type: [phoneSchema],
//         validate: [arrayLimit, "৩টির বেশি মোবাইল নম্বর দেওয়া যাবে না"]
//     },
//     apiVerified: { type: Boolean, default: false },
//     referralCode: {
//         type: String,
//         unique: true,
//         sparse: true
//     },
//     country: String,
//     countryCode: String,
//     balance: { type: Number, default: 0, min: 0 },
//     cashReward: { type: Number, default: 0, min: 0 },
//     totalBonus: { type: Number, default: 0, min: 0 },
//     role: {
//         type: String,
//         default: "user",
//         enum: ["user", "admin", "agent"]
//     },
//     isActive: { type: Boolean, default: true },
//     isVerified: {
//         email: { type: Boolean, default: false },
//         phone: { type: Boolean, default: false }
//     },
//     lastLoginTime: { type: Date, default: Date.now },
//     lastLoginIp: { type: String, default: "0.0.0.0" },
//     levelOneReferrals: [{ type: String, ref: 'User' }],
//     levelTwoReferrals: [{ type: String, ref: 'User' }],
//     levelThreeReferrals: [{ type: String, ref: 'User' }],
//     referredBy: { type: String, ref: 'User', default: "1" },
//     vipPoints: { type: Number, default: 0, min: 0 },
//     birthday: { type: Date },
//     isBirthdayVerified: { type: Boolean, default: false },
//     last_game_id: { type: String },
//     agentId: { type: String },
//     lastBetTime: { type: Date },
//     lastDepositTime: { type: Date },
//     timestamp: { type: Date, default: Date.now },
//     onlinestatus: { type: Date, default: Date.now },
//     updatetimestamp: { type: Date, default: Date.now },
//     bonus: {
//         name: String,
//         eligibleGames: [{ type: String, ref: "Game" }],
//         bonusAmount: { type: Number, default: 0 },
//         wageringRequirement: { type: Number, default: 0 },
//         isActive: { type: Boolean, default: true },
//         appliedDate: Date
//     },
//     currentSession: {
//         token: { type: String },
//         deviceId: { type: String },
//         loginTime: { type: Date },
//         userAgent: { type: String },
//         ipAddress: { type: String }
//     },
//     isLoggedIn: { type: Boolean, default: false },
//     loginHistory: [{
//         deviceId: String,
//         userAgent: String,
//         ipAddress: String,
//         loginTime: Date,
//         logoutTime: Date
//     }],
//     status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Suspended'] },
//     lastLogin: { type: Date },
//     lastActivity: { type: Date },
//     twoFactorEnabled: { type: Boolean, default: false },
//     twoFactorSecret: String,
//     twoFactorBackupCodes: [{
//         code: String,
//         used: { type: Boolean, default: false },
//         usedAt: Date
//     }],
//     loginAttempts: { type: Number, default: 0 },
//     lockUntil: Date,
//     securityQuestions: [{
//         question: String,
//         answer: String
//     }]
// }, {
//     timestamps: true,
//     toJSON: {
//         virtuals: true,
//         transform: function (doc, ret) {
//             delete ret.password;
//             delete ret.resetCode;
//             delete ret.resetExpiry;
//             delete ret.__v;
//             delete ret.twoFactorSecret;
//             delete ret.passwordResetToken;
//             delete ret.passwordResetExpires;
//             return ret;
//         }
//     }
// });

// // Virtual for locked status
// userSchema.virtual('isLocked').get(function () {
//     return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// // 1. COMPARE PASSWORD METHOD
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // 2. CHECK IF PASSWORD CHANGED AFTER TOKEN ISSUED
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//     if (this.passwordChangedAt) {
//         const changedTimestamp = parseInt(
//             this.passwordChangedAt.getTime() / 1000,
//             10
//         );
//         return JWTTimestamp < changedTimestamp;
//     }
//     return false;
// };

// // 3. GENERATE PASSWORD RESET TOKEN
// userSchema.methods.createPasswordResetToken = function () {
//     const resetToken = crypto.randomBytes(32).toString('hex');
    
//     this.passwordResetToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');
    
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
//     return resetToken;
// };

// // 4. ADD LOGIN HISTORY
// userSchema.methods.addLoginHistory = async function (deviceInfo) {
//     this.loginHistory.push({
//         deviceId: deviceInfo.deviceId || 'unknown',
//         userAgent: deviceInfo.userAgent || req.headers['user-agent'],
//         ipAddress: deviceInfo.ipAddress || req.ip,
//         loginTime: new Date()
//     });
    
//     // Keep only last 10 login records
//     if (this.loginHistory.length > 10) {
//         this.loginHistory = this.loginHistory.slice(-10);
//     }
    
//     return this.save();
// };

// // 5. CREATE 2FA SECRET
// userSchema.methods.create2FASecret = function () {
//     const secret = crypto.randomBytes(20).toString('hex');
//     this.twoFactorSecret = secret;
//     this.twoFactorEnabled = true;
    
//     // Generate backup codes
//     const backupCodes = [];
//     for (let i = 0; i < 10; i++) {
//         backupCodes.push({
//             code: crypto.randomBytes(4).toString('hex').toUpperCase(),
//             used: false
//         });
//     }
//     this.twoFactorBackupCodes = backupCodes;
    
//     return { secret, backupCodes: backupCodes.map(bc => bc.code) };
// };

// // 6. VERIFY 2FA TOKEN
// userSchema.methods.verify2FAToken = function (token, isBackupCode = false) {
//     if (isBackupCode) {
//         // Verify backup code
//         const backupCode = this.twoFactorBackupCodes.find(
//             bc => bc.code === token && !bc.used
//         );
        
//         if (backupCode) {
//             backupCode.used = true;
//             backupCode.usedAt = new Date();
//             return true;
//         }
//         return false;
//     }
    
//     // For TOTP verification (you'll need speakeasy or otplib)
//     // This is a placeholder - implement with actual TOTP library
//     const speakeasy = require('speakeasy');
//     return speakeasy.totp.verify({
//         secret: this.twoFactorSecret,
//         encoding: 'hex',
//         token: token,
//         window: 1
//     });
// };

// // 7. UPDATE LOGOUT HISTORY
// userSchema.methods.updateLogoutHistory = async function (deviceId) {
//     const loginRecord = this.loginHistory.find(
//         record => record.deviceId === deviceId && !record.logoutTime
//     );
    
//     if (loginRecord) {
//         loginRecord.logoutTime = new Date();
//         await this.save();
//     }
// };

// // 8. LOGOUT METHOD
// userSchema.methods.logout = async function (deviceId) {
//     this.isLoggedIn = false;
//     this.currentSession = undefined;
    
//     if (deviceId) {
//         await this.updateLogoutHistory(deviceId);
//     }
    
//     return this.save();
// };

// // Pre-save hooks
// userSchema.pre("save", async function (next) {
//     // Password hashing
//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 12);
//         this.passwordChangedAt = Date.now() - 1000;
//     }
    
//     // Generate referral code if not exists
//     if (!this.referralCode) {
//         let referralCode;
//         let attempts = 0;
//         const maxAttempts = 10;
        
//         do {
//             referralCode = generateReferralCode();
//             attempts++;
            
//             if (attempts > maxAttempts) {
//                 return next(new Error('Failed to generate unique referral code'));
//             }
            
//             const existingUser = await this.constructor.findOne({ referralCode });
//             if (!existingUser) {
//                 break;
//             }
//         } while (true);
        
//         this.referralCode = referralCode;
//     }
    
//     // Update timestamp
//     this.updatetimestamp = new Date();
    
//     // Ensure one default phone only
//     if (this.phone && this.phone.length > 0) {
//         const defaults = this.phone.filter(p => p.isDefault);
        
//         if (defaults.length > 1) {
//             return next(new Error("Only one phone can be default"));
//         }
        
//         if (defaults.length === 0 && this.phone.length > 0) {
//             this.phone[0].isDefault = true;
//         }
//     }
    
//     next();
// });

// // Indexes
// userSchema.index({ userId: 1 }, { unique: true });
// userSchema.index({ "phone.number": 1 }, { unique: true, sparse: true });
// userSchema.index({ referralCode: 1 }, { sparse: true });
// userSchema.index({ referredBy: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ isActive: 1 });
// userSchema.index({ lastLoginTime: -1 });
// userSchema.index({ balance: -1 });
// userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });

// // Helper function for referral code generation
// function generateReferralCode(length = 6) {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
    
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
    
//     return result;
// }

// module.exports = mongoose.model("User", userSchema);