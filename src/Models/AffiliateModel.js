const mongoose = require('mongoose');

// const contactInfoSchema = new mongoose.Schema({
//     phoneNumber: { type: String, trim: true, required: false },
//     email: { 
//         type: String, 
//         trim: true, 
//         required: false, 
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
//     },
//     whatsApp: { type: String, trim: true, required: false }
// });


// const earningsStatusSchema = new mongoose.Schema({
//     pending: { type: Number, default: 0 },
//     available: { type: Number, default: 0 },
//     processingWithdrawal: { type: Number, default: 0 }
// });



const AffiliateSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // confirmPassword: {
    //     type: String,
    //     required: true
    // },
    currencyType: {
        type: String,
        
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    dateOfBirth: {
        type: Date,
        // required: true
    },
    callingCode: {
        type: String,
        // required: true
    },
    phone: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contactType: {
        type: String,
        
    },
    contactTypeValue: {
        type: String,
        
    },
    captcha: { type: String},
    lastWithdrawalTime: { type: Date, },
    referralCode: { type: String, unique: true, min: 11, max: 11 },
    affiliateId: { type: String, unique: true, min: 11, max: 11 },
    referredLink: { type: String },
    user_role: { type: String, default: 'affiliate' },
    accountStatus: { type: String, enum: ['Active', 'Suspended', 'Closed'], default: 'Active' },
    approvedDateTime: { type: Date, default: Date.now },
    lastLoginTime: { type: Date},
    // contactInfo: { type: contactInfoSchema, required: true },
    // earnings: earningsSchema,
    commission: { type: Number, default: 0 },
    // earningsStatus: earningsStatusSchema,
    // links: [linksSchema],
    timestamps: { type: Date, default: Date.now }
})

const Affiliate = mongoose.model('Affiliate', AffiliateSchema);
module.exports = Affiliate;
