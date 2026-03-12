const mongoose = require("mongoose");

const promoClaimSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    campaignCode: { type: String, required: true, index: true },
    transactionId: { type: String, index: true },
    depositAmount: { type: Number, required: true },
    vipLevel: { type: String, default: "Bronze" },
    bonusPercent: { type: Number, required: true },
    bonusAmount: { type: Number, required: true },
    wageringMultiplier: { type: Number, default: 1 },
    freeSpinCount: { type: Number, default: 0 },
    freeSpinGames: [{ type: String }],
    freeSpinStatus: {
      type: String,
      enum: ["not_applicable", "pending", "credited", "expired"],
      default: "not_applicable",
      index: true,
    },
    freeSpinCreditAt: { type: Date, index: true },
    freeSpinExpireAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    failureReason: { type: String },
  },
  { timestamps: true }
);

promoClaimSchema.index({ userId: 1, createdAt: -1 });
promoClaimSchema.index({ campaignCode: 1, createdAt: -1 });

module.exports = mongoose.model("PromoClaim", promoClaimSchema);
