const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true },
    transactionID: { type: String, required: true, unique: true },
    base_amount: { type: Number, required: true },
    // currency_rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    //currency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Currency", required: true },
    //gateway: { type: Number, enum: [0, 1, 2, 3], required: true }, // 0 = Agent, 1 = Online, 2 = Token, 3 = Bank
    gateway_name: { type: String, required: true },
    type: { type: String, required: true },
    coin: { type: Number, default: 0 },
    status: { type: Number, enum: [0, 1, 2], required: true }, // 0 = Hold, 1 = Accept, 2 = Reject
    details: { type: String },
    datetime: { type: Date, default: Date.now },
    is_commission: { type: Boolean, default: false },
    referredbyCode: { type: String },
    referredbyCode: { type: String },
    updatetime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
