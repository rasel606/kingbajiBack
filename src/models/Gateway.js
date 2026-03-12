const mongoose = require("mongoose");

/**
 * Gateway Schema - যে গেটওয়ে এডমিন, সাব-এডমিন বা এফিলিয়েট ব্যবহার করে
 */
const gatewaySchema = new mongoose.Schema(
  {
    gatewayId: {
      type: String,
      required: true,
      unique: true,
    },
    ownerId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    ownerRole: {
      type: String,
      required: true,
      enum: ["admin", "subAdmin", "affiliate", "user"],
    },
    gatewayName: {
      type: String,
      required: true,
    },
    gatewayType: {
      type: String,
      required: true,
      enum: ["bKash", "Nagad", "Rocket", "Bank", "Crypto", "Other"],
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // গেটওয়ে ব্যালেন্স ট্র্যাকিং
    balance: {
      type: Number,
      default: 0,
    },
    // এই গেটওয়ে দিয়ে কত ডিপজিট হয়েছে
    totalDeposits: {
      type: Number,
      default: 0,
    },
    // এই গেটওয়ে দিয়ে কত উইথড্র হয়েছে
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    // পেমেন্ট লিমিট
    minDeposit: {
      type: Number,
      default: 100,
    },
    maxDeposit: {
      type: Number,
      default: 100000,
    },
    minWithdrawal: {
      type: Number,
      default: 500,
    },
    maxWithdrawal: {
      type: Number,
      default: 50000,
    },
    // গেটওয়ে কনফিগারেশন
    configuration: {
      apiKey: String,
      apiSecret: String,
      webhookUrl: String,
      additionalSettings: mongoose.Schema.Types.Mixed,
    },
    // গেটওয়ে স্ট্যাটিস্টিক্স
    statistics: {
      successfulTransactions: { type: Number, default: 0 },
      failedTransactions: { type: Number, default: 0 },
      pendingTransactions: { type: Number, default: 0 },
      lastTransactionAt: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
gatewaySchema.index({ ownerId: 1, isActive: 1 });
gatewaySchema.index({ gatewayType: 1, isActive: 1 });

const Gateway = mongoose.model("Gateway", gatewaySchema);
module.exports = Gateway;
