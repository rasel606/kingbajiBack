const { ref } = require("joi");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true },
    transactionID: { type: String, required: true },
    base_amount: { type: Number, required: true },
    bonus_amount: { type: Number },
    amount: { type: Number },
    mobile: { type: Number, required: true },
    gateway_Number: { type: Number },

    gateway_name: {
        type: String,
        enum: ["Bkash", "Nagad", "Rocket", "Upay", "transfer"],
        required: true,
    },

    type: {
        type: Number,
        enum: [0, 1, 2, 3], // 0 = Deposit, 1 = Withdrawal
        required: true,
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3], // 0 = Hold, 1 = Accept, 2 = Reject
        required: true,
    },

    details: { type: String },

    payment_type: {
        type: String,
        enum: ["Send Money", "Cashout", "Payment", "transfer"],
    },
    bonusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
    isBonusApplied: { type: Boolean, default: false },
    bonusStatus: {
        type: String,
        enum: ['pending', 'active', 'completed', 'expired', 'cancelled']
    },
    turnoverRequirement: { type: Number, default: 0 },
    turnoverCompleted: { type: Number, default: 0 },
    // role:{ type: String, ref: ['User', 'SubAdmin', 'Agent', "Admin"] },
    isTurnoverCompleted: { type: Boolean, default: false },
    expiryDate: { type: Date }, // For bonus expiry
    is_commission: { type: Boolean, default: false },
    referredBy: { type: String },
    paymentGatewayOwner: { type: String,  enum: ['User', 'SubAdmin', 'Agent', "Admin"] },
    referredbysubAdmin: { type: String, ref: 'SubAdmin' },
    datetime: { type: Date, default: Date.now },
    updatetime: { type: Date, default: Date.now },
    
});




// Enable virtuals in JSON and Object output
// transactionSchema.set("toObject", { virtuals: true });
// transactionSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("Transaction", transactionSchema);
