// models/user/userSchema.js
const mongoose = require("mongoose");

function arrayLimit(val) {
    return val.length <= 3;
}

const phoneSchema = new mongoose.Schema({
    countryCode: { type: String, required: true },
    number: {
        type: String,
        required: true,
        validate: {
            validator: v => /^\d{10,15}$/.test(v),
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    isDefault: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    verificationCode: String,
    verificationExpiry: Date
});

// const bonusSchema = new mongoose.Schema({
//     name: String,
//     eligibleGames: [{ type: String, ref: "Game" }],
//     bonusAmount: { type: Number, default: 0 },
//     wageringRequirement: { type: Number, default: 0 },
//     isActive: { type: Boolean, default: true },
//     appliedDate: Date
// });

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: String,
    email: String,
    password: { type: String, required: true },
    phone: {
        type: [phoneSchema],
        validate: [arrayLimit, "Cannot add more than 3 phone numbers"]
    },
    apiVerified: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true },
    country: String,
    countryCode: String,
    balance: { type: Number, default: 0 },
    cashReward: { type: Number, default: 0 },
    totalBonus: { type: Number, default: 0 },
    role: { type: String, default: "user" },
    isActive: { type: Boolean, default: true },
    isVerified: { email: Boolean },

    lastLoginTime: { type: Date, default: Date.now },
    lastLoginIp: { type: String, default: "0.0.0.0" },
    levelOneReferrals: [{ type: String, ref: 'User' }],
    levelTwoReferrals: [{ type: String, ref: 'User' }],
    levelThreeReferrals: [{ type: String, ref: 'User' }],
    apiVerified: { type: Boolean, default: false },
    vipPoints: { type: Number, default: 0 },
    birthday: { type: Date },
    isBirthdayVerified: { type: Boolean, default: false },
    last_game_id: { type: String },
    agentId: { type: String },
    lastBetTime: { type: Date, default: Date.now },
    lastDepositTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    onlinestatus: { type: Date, default: Date.now },
    updatetimestamp: { type: Date, default: Date.now },
    bonus: {
        name: String,
        eligibleGames: [{ type: String, ref: "Game" }],
        bonusAmount: { type: Number, default: 0 },
        wageringRequirement: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        appliedDate: Date
    },
    
    
    // Lock & reset fields
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    resetCode: String,
    resetExpiry: Date
});

module.exports = userSchema;
