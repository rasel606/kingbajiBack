const config = require('../Services/VipService');



 const vipLevels = {
    bronze: {
      name: 'Bronze',
      monthlyTurnoverRequirement: 0,
      vpConversionRate: 5000,
      loyaltyBonus: 0.01 // 1% of turnover
    },
    silver: {
      name: 'Silver',
      monthlyTurnoverRequirement: 300000,
      vpConversionRate: 1250,
      loyaltyBonus: 0.02 // 2% of turnover
    },
    gold: {
      name: 'Gold',
      monthlyTurnoverRequirement: 800000,
      vpConversionRate: 1000,
      loyaltyBonus: 0.03 // 3% of turnover
    },
    diamond: {
      name: 'Diamond',
      monthlyTurnoverRequirement: 2000000,
      vpConversionRate: 500,
      loyaltyBonus: 0.05 // 5% of turnover
    },
    elite: {
      name: 'Elite',
      monthlyTurnoverRequirement: 5000000,
      vpConversionRate: 400,
      loyaltyBonus: 0.07 // 7% of turnover
    }
  }


exports.calculateVipLevel = (monthlyTurnover) => {
  console.log(monthlyTurnover);
  if (monthlyTurnover >= vipLevels.elite.monthlyTurnoverRequirement) {
    return 'Elite';
  } else if (monthlyTurnover >= vipLevels.diamond.monthlyTurnoverRequirement) {
    return 'Diamond';
  } else if (monthlyTurnover >= vipLevels.gold.monthlyTurnoverRequirement) {
    return 'Gold';
  } else if (monthlyTurnover >= vipLevels.silver.monthlyTurnoverRequirement) {
    return 'Silver';
  }
  return 'Bronze';
};

exports.calculateVipPoints = (turnover, currentLevel) => {
  const level = currentLevel.toLowerCase();
  const conversionRate = vipLevels[level].vpConversionRate;
  return turnover / conversionRate;
};