const PromoCampaign = require("../models/PromoCampaign");
const PromoClaim = require("../models/PromoClaim");
const UserVip = require("../models/UserVip");
const {
  VIP_8_PERCENT_CODE,
  evaluateVipUnlimited8Promo,
} = require("./promoRuleEngine");
const { sendWebhook } = require("./webhookNotifier");

function getDefaultFreeSpinTiers() {
  return [
    { minDeposit: 500, maxDeposit: 1000, spins: 5 },
    { minDeposit: 1001, maxDeposit: 5000, spins: 10 },
    { minDeposit: 5001, maxDeposit: 10000, spins: 50 },
    { minDeposit: 10001, maxDeposit: 20000, spins: 100 },
    { minDeposit: 20001, maxDeposit: 35000, spins: 200 },
    { minDeposit: 35001, maxDeposit: 999999999, spins: 350 },
  ];
}

function getDefaultEligibleGames() {
  return [
    "Golden Bank",
    "Charge Buffalo",
    "Money Coming",
    "Boxing King",
    "Golden Empire",
    "Fortune Gems",
    "Alibaba",
    "Mega Ace",
    "Fortune Gems 2",
  ];
}

function getNextCreditAtBST(hour = 23) {
  const nowUtc = new Date();
  const nowBstMs = nowUtc.getTime() + 6 * 60 * 60 * 1000;

  const todayAtHourBst = new Date(nowBstMs);
  todayAtHourBst.setHours(hour, 0, 0, 0);

  let targetBstMs = todayAtHourBst.getTime();
  if (targetBstMs <= nowBstMs) {
    targetBstMs += 24 * 60 * 60 * 1000;
  }

  return new Date(targetBstMs - 6 * 60 * 60 * 1000);
}

async function ensureVip8Campaign(adminUserId = "system") {
  const defaultDoc = {
    code: VIP_8_PERCENT_CODE,
    name: "8% Unlimited Deposit Bonus",
    description:
      "VIP level ভিত্তিক 4%/6%/8% ডিপোজিট বোনাস + JILI ফ্রি স্পিনস (সীমাহীন ক্লেইম)",
    isActive: true,
    campaignType: "VIP_DEPOSIT_UNLIMITED",
    config: {
      bonusType: "percentage",
      wageringMultiplier: 1,
      maxBonusPercent: 8,
      vipRates: {
        copperBronze: 4,
        silverGold: 6,
        rubyPlus: 8,
      },
      freeSpinEligibleGames: getDefaultEligibleGames(),
      freeSpinTiers: getDefaultFreeSpinTiers(),
      freeSpinCreditHourBST: 23,
      freeSpinExpiryDays: 3,
      allowUnlimitedClaims: true,
    },
    metadata: {
      labels: ["vip", "deposit", "free-spins", "phase-1"],
      createdBy: adminUserId,
      updatedBy: adminUserId,
    },
  };

  const campaign = await PromoCampaign.findOneAndUpdate(
    { code: VIP_8_PERCENT_CODE },
    { $setOnInsert: defaultDoc, $set: { isActive: true, "metadata.updatedBy": adminUserId } },
    { upsert: true, new: true }
  );

  return campaign;
}

async function evaluateDepositPromotion({ userId, depositAmount, promoCode }) {
  if (!promoCode) return null;

  const campaign = await PromoCampaign.findOne({
    code: String(promoCode).trim(),
    isActive: true,
  }).lean();

  if (!campaign) {
    throw new Error("Selected promotion is not active or not found");
  }

  if (campaign.campaignType !== "VIP_DEPOSIT_UNLIMITED") {
    throw new Error("Promotion এখনো এই API flow-তে supported না");
  }

  const userVip = await UserVip.findOne({ userId }).lean();
  const vipLevel = userVip?.currentLevel || "Bronze";

  const evaluation = evaluateVipUnlimited8Promo({
    depositAmount,
    vipLevel,
    vipRates: campaign.config?.vipRates || {},
    freeSpinTiers: campaign.config?.freeSpinTiers || [],
    maxBonusPercent: campaign.config?.maxBonusPercent ?? 8,
  });

  const freeSpinCreditAt = evaluation.freeSpinCount > 0
    ? getNextCreditAtBST(campaign.config?.freeSpinCreditHourBST ?? 23)
    : null;

  const freeSpinExpireAt = freeSpinCreditAt
    ? new Date(
        freeSpinCreditAt.getTime() +
          Number(campaign.config?.freeSpinExpiryDays ?? 3) * 24 * 60 * 60 * 1000
      )
    : null;

  const claim = await PromoClaim.create({
    userId,
    campaignCode: campaign.code,
    depositAmount: Number(depositAmount),
    vipLevel,
    bonusPercent: evaluation.bonusPercent,
    bonusAmount: evaluation.bonusAmount,
    wageringMultiplier: Number(campaign.config?.wageringMultiplier ?? 1),
    freeSpinCount: evaluation.freeSpinCount,
    freeSpinGames: campaign.config?.freeSpinEligibleGames || [],
    freeSpinStatus: evaluation.freeSpinCount > 0 ? "pending" : "not_applicable",
    freeSpinCreditAt,
    freeSpinExpireAt,
    status: "pending",
  });

  await sendWebhook("promo.claim.created", {
    claimId: claim._id,
    userId,
    campaignCode: campaign.code,
    bonusPercent: evaluation.bonusPercent,
    bonusAmount: evaluation.bonusAmount,
    freeSpinCount: evaluation.freeSpinCount,
  });

  return {
    campaign,
    claim,
    evaluation,
  };
}

async function finalizePromotionClaim({ claimId, transactionId, bonusAmount, failedReason }) {
  const update = failedReason
    ? { status: "failed", failureReason: failedReason }
    : {
        status: "completed",
        transactionId,
        bonusAmount: Number(bonusAmount || 0),
      };

  const claim = await PromoClaim.findByIdAndUpdate(claimId, { $set: update }, { new: true });

  if (claim) {
    await sendWebhook("promo.claim.finalized", {
      claimId: claim._id,
      userId: claim.userId,
      transactionId: claim.transactionId,
      status: claim.status,
      freeSpinStatus: claim.freeSpinStatus,
      failureReason: claim.failureReason,
    });
  }

  return claim;
}

async function creditDueFreeSpins(limit = 200) {
  const dueClaims = await PromoClaim.find({
    freeSpinStatus: "pending",
    freeSpinCreditAt: { $lte: new Date() },
    status: "completed",
  })
    .sort({ freeSpinCreditAt: 1 })
    .limit(limit);

  const results = {
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const claim of dueClaims) {
    try {
      claim.freeSpinStatus = "credited";
      await claim.save();

      await sendWebhook("promo.freeSpins.credited", {
        claimId: claim._id,
        userId: claim.userId,
        campaignCode: claim.campaignCode,
        freeSpinCount: claim.freeSpinCount,
        freeSpinGames: claim.freeSpinGames,
      });

      results.processed += 1;
      results.success += 1;
    } catch (error) {
      results.processed += 1;
      results.failed += 1;
      results.errors.push({ claimId: claim._id, error: error.message });
    }
  }

  return results;
}

module.exports = {
  ensureVip8Campaign,
  evaluateDepositPromotion,
  finalizePromotionClaim,
  creditDueFreeSpins,
};
