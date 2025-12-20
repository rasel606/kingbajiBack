// // models/WalletTransaction.js
// const mongoose = require('mongoose');

// const BonusWalletTransactionSchema = new mongoose.Schema({
//   userId: { type: String, required: true },

//   walletType: {
//     type: String,
//     enum: ['BONUS'],
//     required: true
//   },

//   type: {
//     type: String,
//     enum: ['Claimed', 'REFUND'],
//     required: true
//   },

//   amount: { type: Number, required: true },
//   balanceBefore: Number,
//   balanceAfter: Number,

//   ref: String,        // betId / depositId / provider ref
//   remark: String
// }, { timestamps: true },

// );

// module.exports = mongoose.model('BonusWalletTransaction', BonusWalletTransactionSchema);


const mongoose = require('mongoose');

const BonusWalletTransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    walletType: { type: String, enum: ['BONUS'], required: true },

    type: { type: String, enum: ['CLAIMED', 'DEBIT'], required: true },

    amount: { type: Number, required: true },
    
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: String },

    transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

    remark: String,

}, { timestamps: true });

module.exports = mongoose.model("BonusWalletTransaction", BonusWalletTransactionSchema);
