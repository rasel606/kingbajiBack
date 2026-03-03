// utils/vipUtils.js
class VipCalculator {
  static calculateVipPoints(turnover, vipLevel) {
    return turnover / vipLevel.vpConversionRate;
  }

  static calculateProgress(currentTurnover, nextLevelRequirement) {
    return Math.min((currentTurnover / nextLevelRequirement) * 100, 100);
  }

  static determineVipLevel(turnover, vipLevels) {
    return vipLevels.reduce((currentLevel, level) => {
      return turnover >= level.monthlyTurnoverRequirement ? level : currentLevel;
    }, vipLevels[0]);
  }
}

module.exports = VipCalculator;