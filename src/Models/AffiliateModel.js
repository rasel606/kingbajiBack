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
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: false },
    lastWithdrawalTime: { type: Date, required: false },
    referralByCode: { type: String, min: 11, max: 11 },
    referralCode: { type: String, unique: true, min: 11, max: 11 },
    SubAdminId: { type: String, min: 11, max: 11 },
    accountStatus: { type: String, enum: ['Active', 'Suspended', 'Closed'], default: 'Active' },
    approvedDateTime: { type: Date, default: Date.now },
    lastLoginTime: { type: Date, required: false },
    referralCode: { type: String, trim: true, required: false, unique: true },
    // contactInfo: { type: contactInfoSchema, required: true },
    // earnings: earningsSchema,
    commission: { type: Number, default: 0 },
    // earningsStatus: earningsStatusSchema,
    // links: [linksSchema],
    timestamps: { type: Date, default: Date.now }
})

const Affiliate = mongoose.model('Affiliate', AffiliateSchema);
module.exports = Affiliate;
