const mongoose = require("mongoose");

const freeSpinTierSchema = new mongoose.Schema(
  {
    minDeposit: { type: Number, required: true },
    maxDeposit: { type: Number, required: true },
    spins: { type: Number, required: true },
  },
  { _id: false }
);

const promoCampaignSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    campaignType: {
      type: String,
      enum: ["VIP_DEPOSIT_UNLIMITED", "CASHBACK", "RELOAD", "FIRST_DEPOSIT", "CUSTOM"],
      default: "CUSTOM",
      index: true,
    },
    config: {
      bonusType: { type: String, default: "percentage" },
      wageringMultiplier: { type: Number, default: 1 },
      maxBonusPercent: { type: Number, default: 8 },
      vipRates: {
        copperBronze: { type: Number, default: 4 },
        silverGold: { type: Number, default: 6 },
        rubyPlus: { type: Number, default: 8 },
      },
      freeSpinEligibleGames: [{ type: String }],
      freeSpinTiers: [freeSpinTierSchema],
      freeSpinCreditHourBST: { type: Number, default: 23 },
      freeSpinExpiryDays: { type: Number, default: 3 },
      allowUnlimitedClaims: { type: Boolean, default: true },
    },
    metadata: {
      terms: [{ type: String }],
      labels: [{ type: String }],
      createdBy: { type: String },
      updatedBy: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCampaign", promoCampaignSchema);
