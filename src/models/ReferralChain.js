const mongoose = require("mongoose");

/**
 * Referral Chain Schema - রেফারেল চেইন ট্র্যাক করার জন্য
 * এই স্কিমা দিয়ে পুরো রেফারেল হায়ারার্কি ট্র্যাক করা যাবে
 */
const referralChainSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    // সরাসরি রেফারার (যে রেফার করেছে)
    directReferrer: {
      userId: String,
      role: String,
      referralCode: String,
      hasGateway: { type: Boolean, default: false },
    },
    // Gateway Owner - যার গেটওয়ে ব্যবহার হবে
    gatewayOwner: {
      userId: String,
      role: String,
      referralCode: String,
    },
    // Bonus Deduction Owner - যার থেকে বোনাস কাটা হবে
    bonusDeductionOwner: {
      userId: String,
      role: String,
      referralCode: String,
    },
    // পুরো রেফারেল চেইন (নিচ থেকে উপরে)
    fullChain: [
      {
        userId: String,
        role: String,
        referralCode: String,
        level: Number,
        hasGateway: { type: Boolean, default: false },
      },
    ],
    // রোল অনুযায়ী চেইন
    adminId: String,
    subAdminId: String,
    affiliateId: String,
    // Level information
    userLevel: {
      type: Number,
      default: 0,
    },
    // এই ইউজার কোন টাইপের (admin, subAdmin, affiliate, user)
    userRole: {
      type: String,
      required: true,
      enum: ["admin", "subAdmin", "affiliate", "user"],
    },
    // এই ইউজারের নিজের গেটওয়ে আছে কি না
    hasOwnGateway: {
      type: Boolean,
      default: false,
    },
    // Statistics
    totalDirectReferrals: {
      type: Number,
      default: 0,
    },
    totalIndirectReferrals: {
      type: Number,
      default: 0,
    },
    // Bonus tracking
    totalBonusEarned: {
      type: Number,
      default: 0,
    },
    totalBonusDeducted: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
referralChainSchema.index({ "directReferrer.userId": 1 });
referralChainSchema.index({ "gatewayOwner.userId": 1 });
referralChainSchema.index({ "bonusDeductionOwner.userId": 1 });
referralChainSchema.index({ adminId: 1 });
referralChainSchema.index({ subAdminId: 1 });
referralChainSchema.index({ affiliateId: 1 });
referralChainSchema.index({ userRole: 1 });

const ReferralChain = mongoose.model("ReferralChain", referralChainSchema);
module.exports = ReferralChain;
