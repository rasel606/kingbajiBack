// // models/user/userSchema.js
// const mongoose = require("mongoose");

// function arrayLimit(val) {
//     return val.length <= 3;
// }

// const phoneSchema = new mongoose.Schema({
//     countryCode: { type: String, required: true },
//     number: {
//         type: String,
//         required: true,
//         validate: {
//             validator: v => /^\d{10,15}$/.test(v),
//             message: props => `${props.value} is not a valid phone number!`
//         }
//     },
//     isDefault: { type: Boolean, default: false },
//     verified: { type: Boolean, default: false },
//     verificationCode: String,
//     verificationExpiry: Date
// });

// // const bonusSchema = new mongoose.Schema({
// //     name: String,
// //     eligibleGames: [{ type: String, ref: "Game" }],
// //     bonusAmount: { type: Number, default: 0 },
// //     wageringRequirement: { type: Number, default: 0 },
// //     isActive: { type: Boolean, default: true },
// //     appliedDate: Date
// // });

// const userSchema = new mongoose.Schema({
//     userId: { type: String, required: true, unique: true },
//     name: String,
//     email: String,
//     password: { type: String, required: true },
//     phone: {
//         type: [phoneSchema],
//         validate: [arrayLimit, "Cannot add more than 3 phone numbers"]
//     },
//     apiVerified: { type: Boolean, default: false },
//     referralCode: { type: String, unique: true, sparse: true },
//     country: String,
//     countryCode: String,
//     balance: { type: Number, default: 0 },
//     cashReward: { type: Number, default: 0 },
//     totalBonus: { type: Number, default: 0 },
//     role: { type: String, default: "user" },
//     isActive: { type: Boolean, default: true },
//     isVerified: { email: Boolean },

//     lastLoginTime: { type: Date, default: Date.now },
//     lastLoginIp: { type: String, default: "0.0.0.0" },
//     levelOneReferrals: [{ type: String, ref: 'User' }],
//     levelTwoReferrals: [{ type: String, ref: 'User' }],
//     levelThreeReferrals: [{ type: String, ref: 'User' }],
//     apiVerified: { type: Boolean, default: false },
//     vipPoints: { type: Number, default: 0 },
//     birthday: { type: Date },
//     isBirthdayVerified: { type: Boolean, default: false },
//     last_game_id: { type: String },
//     agentId: { type: String },
//     lastBetTime: { type: Date, default: Date.now },
//     lastDepositTime: { type: Date, default: Date.now },
//     isActive: { type: Boolean, default: true },
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
    
    
//     // Lock & reset fields
//     loginAttempts: { type: Number, default: 0 },
//     lockUntil: Date,
//     resetCode: String,
//     resetExpiry: Date
// });

// module.exports = userSchema;




// const mongoose = require("mongoose");

// // Validator for phone array length
// function arrayLimit(val) {
//   return val.length <= 3;
// }

// // Phone sub-schema
// const phoneSchema = new mongoose.Schema({
//   countryCode: { type: String, required: true },
//   number: {
//     type: String,
//     required: true,
//     validate: {
//       validator: v => /^\d{10,15}$/.test(v),
//       message: props => `${props.value} is not a valid phone number!`
//     }
//   },
//   isDefault: { type: Boolean, default: false },
//   verified: { type: Boolean, default: false },
//   verificationCode: String,
//   verificationExpiry: Date
// }, { _id: false });

// // Bonus sub-schema
// const bonusSchema = new mongoose.Schema({
//   name: String,
//   eligibleGames: [{ type: String, ref: "Game" }],
//   bonusAmount: { type: Number, default: 0 },
//   wageringRequirement: { type: Number, default: 0 },
//   isActive: { type: Boolean, default: true },
//   appliedDate: Date
// }, { _id: false });

// // Main user schema
// const userSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   name: { type: String, default: "" },
//   email: { type: String, default: "" },
//   password: { type: String, required: true },

//   phone: {
//     type: [phoneSchema],
//     validate: [arrayLimit, "Cannot add more than 3 phone numbers"]
//   },

//   referralCode: { type: String, unique: true, sparse: true },
//   referredBy: { type: String, default: null },

//   country: { type: String, default: "" },
//   countryCode: { type: String, default: "" },

//   balance: { type: Number, default: 0 },
//   cashReward: { type: Number, default: 0 },
//   totalBonus: { type: Number, default: 0 },
//   vipPoints: { type: Number, default: 0 },
//   role: { type: String, default: "user" },

//   isActive: { type: Boolean, default: true },

//   isVerified: {
//     email: { type: Boolean, default: false },
//     phone: { type: Boolean, default: false }
//   },

//   isNameVerified: { type: Boolean, default: false },
//   birthday: { type: Date },
//   isBirthdayVerified: { type: Boolean, default: false },

//   lastLoginTime: { type: Date, default: Date.now },
//   lastLoginIp: { type: String, default: "0.0.0.0" },
//   lastBetTime: { type: Date, default: Date.now },
//   lastDepositTime: { type: Date, default: Date.now },
//   last_game_id: { type: String, default: null },
//   agentId: { type: String, default: null },

//   levelOneReferrals: [{ type: String, ref: 'User' }],
//   levelTwoReferrals: [{ type: String, ref: 'User' }],
//   levelThreeReferrals: [{ type: String, ref: 'User' }],

//   bonus: bonusSchema,

//   // Lock & reset fields
//   loginAttempts: { type: Number, default: 0 },
//   lockUntil: { type: Date, default: null },
//   resetCode: { type: String, default: null },
//   resetExpiry: { type: Date, default: null },

//   timestamp: { type: Date, default: Date.now },
//   onlinestatus: { type: Date, default: Date.now },
//   updatetimestamp: { type: Date, default: Date.now },

//   apiVerified: { type: Boolean, default: false }
// });

// // Index for unique phone numbers
// userSchema.index({ "phone.number": 1 }, { unique: true, sparse: true });

// // Pre-save hook: only one default phone
// userSchema.pre("save", function (next) {
//   const defaults = this.phone.filter(p => p.isDefault);
//   if (defaults.length > 1) return next(new Error("Only one phone can be default"));
//   next();
// });

// module.exports = userSchema;

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
    referredBy: { type: String, ref: 'User' },
    
    // User profile
    vipPoints: { type: Number, default: 0, min: 0 },
    birthday: { type: Date },
    isBirthdayVerified: { type: Boolean, default: false },
    
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
    
    // Security
    loginAttempts: { type: Number, default: 0, min: 0 },
    lockUntil: Date,
    resetCode: String,
    resetExpiry: Date

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.resetCode;
            delete ret.resetExpiry;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual for locked status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = userSchema;