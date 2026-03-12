const mongoose = require("mongoose");

/**
 * Bonus Transaction Schema - বোনাস ট্রানজেকশন ট্র্যাক করার জন্য
 */
const bonusTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    // যে ইউজার ডিপজিট করেছে
    depositorUserId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    // যার থেকে বোনাস কাটা হয়েছে
    bonusDeductedFrom: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    // Deposit amount
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Bonus percentage
    bonusPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    // Bonus amount
    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Transaction type
    transactionType: {
      type: String,
      required: true,
      enum: [
        "deposit_bonus",
        "referral_bonus",
        "level1_bonus",
        "level2_bonus",
        "level3_bonus",
        "affiliate_bonus",
        "commission",
      ],
    },
    // Gateway information
    gatewayUsed: {
      gatewayId: String,
      gatewayOwnerId: String,
      gatewayType: String,
    },
    // Referral chain at time of transaction
    referralChainSnapshot: [
      {
        userId: String,
        role: String,
        level: Number,
      },
    ],
    // Status
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "failed", "cancelled", "reversed"],
    },
    // Additional details
    details: {
      depositId: String,
      paymentMethod: String,
      transactionReference: String,
      notes: String,
    },
    // Timestamps
    completedAt: Date,
    failedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
bonusTransactionSchema.index({ depositorUserId: 1, createdAt: -1 });
bonusTransactionSchema.index({ bonusDeductedFrom: 1, createdAt: -1 });
bonusTransactionSchema.index({ transactionType: 1 });
bonusTransactionSchema.index({ status: 1 });
bonusTransactionSchema.index({ "gatewayUsed.gatewayOwnerId": 1 });

const BonusTransaction = mongoose.model(
  "BonusTransaction",
  bonusTransactionSchema
);
module.exports = BonusTransaction;
