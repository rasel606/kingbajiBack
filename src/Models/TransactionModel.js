const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transactionID: { type: String, required: true, unique: true },
    base_amount: { type: Number, required: true },
    currency_rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Currency", required: true },
    gateway: { type: Number, enum: [0, 1, 2, 3], required: true }, // 0 = Agent, 1 = Online, 2 = Token, 3 = Bank
    getway_name: { type: String, required: true },
    type: { type: String, required: true },
    coin: { type: Number, default: 0 },
    contact_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    status: { type: Number, enum: [0, 1, 2], required: true }, // 0 = Hold, 1 = Accept, 2 = Reject
    details: { type: String },
    datetime: { type: Date, default: Date.now },
    is_commission: { type: Boolean, default: false }
});

module.exports = mongoose.model("Transaction", transactionSchema);
