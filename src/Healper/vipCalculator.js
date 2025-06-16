const config = require('../Services/VipConfig');

exports.calculateVipLevel = (monthlyTurnover) => {
  console.log(monthlyTurnover);
  if (monthlyTurnover >= config.vipLevels.elite.monthlyTurnoverRequirement) {
    return 'Elite';
  } else if (monthlyTurnover >= config.vipLevels.diamond.monthlyTurnoverRequirement) {
    return 'Diamond';
  } else if (monthlyTurnover >= config.vipLevels.gold.monthlyTurnoverRequirement) {
    return 'Gold';
  } else if (monthlyTurnover >= config.vipLevels.silver.monthlyTurnoverRequirement) {
    return 'Silver';
  }
  return 'Bronze';
};

exports.calculateVipPoints = (turnover, currentLevel) => {
  const level = currentLevel.toLowerCase();
  const conversionRate = config.vipLevels[level].vpConversionRate;
  return turnover / conversionRate;
};