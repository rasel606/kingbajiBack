const VIP_8_PERCENT_CODE = "VIP8_UNLIMITED";

function normalizeVipLevel(level) {
  return String(level || "").trim().toLowerCase();
}

function getVipRate(vipLevel, vipRates = {}) {
  const level = normalizeVipLevel(vipLevel);

  const copperBronze = Number(vipRates.copperBronze ?? 4);
  const silverGold = Number(vipRates.silverGold ?? 6);
  const rubyPlus = Number(vipRates.rubyPlus ?? 8);

  if (["copper", "bronze"].includes(level)) return copperBronze;
  if (["silver", "gold"].includes(level)) return silverGold;

  // Existing project levels mapping: Diamond/Elite => Ruby+
  if (["ruby", "sapphire", "diamond", "elite", "emperor"].includes(level)) {
    return rubyPlus;
  }

  // Safe fallback
  return copperBronze;
}

function getFreeSpinsByDeposit(amount, tiers = []) {
  const numericAmount = Number(amount || 0);
  if (!Array.isArray(tiers) || tiers.length === 0 || numericAmount < 500) {
    return 0;
  }

  for (const tier of tiers) {
    const min = Number(tier.minDeposit || 0);
    const max = Number(tier.maxDeposit || 0);
    if (numericAmount >= min && numericAmount <= max) {
      return Number(tier.spins || 0);
    }
  }

  return 0;
}

function evaluateVipUnlimited8Promo({
  depositAmount,
  vipLevel,
  vipRates,
  freeSpinTiers,
  maxBonusPercent,
}) {
  const rate = getVipRate(vipLevel, vipRates);
  const effectiveRate = Math.min(rate, Number(maxBonusPercent || 8));
  const bonusAmount = Number(((Number(depositAmount || 0) * effectiveRate) / 100).toFixed(2));
  const freeSpinCount = getFreeSpinsByDeposit(depositAmount, freeSpinTiers);

  return {
    promoCode: VIP_8_PERCENT_CODE,
    bonusPercent: effectiveRate,
    bonusAmount,
    freeSpinCount,
  };
}

module.exports = {
  VIP_8_PERCENT_CODE,
  normalizeVipLevel,
  getVipRate,
  getFreeSpinsByDeposit,
  evaluateVipUnlimited8Promo,
};
