const BonusConfiguration = require('../models/BonusConfiguration');

/**
 * Bonus Setup Configuration
 * সব bonus configuration এর sample data
 */

const bonusConfigurations = [
  // ১. ৮% আনলিমিটেড ডিপোজিট বোনাস
  {
    bonusId: 'UNLIMITED_DEPOSIT_8',
    bonusName: '8% Unlimited Deposit Bonus',
    bonusNameBn: '৮% আনলিমিটেড ডিপোজিট বোনাস',
    description: 'Get up to 8% unlimited bonus on every deposit based on your VIP level',
    descriptionBn: 'প্রতিটি ডিপোজিটে ৮% পর্যন্ত অ-সীমিত বোনাস পান আপনার VIP লেভেলের উপর ভিত্তি করে',
    bonusType: 'RELOAD_DEPOSIT',
    category: 'DEPOSIT',
    isActive: true,
    isAutomatic: true,
    requiresClaim: false,
    
    eligibility: {
      minDepositAmount: 500,
      allowedGameTypes: ['SLOT', 'LIVE_CASINO', 'SPORTS', 'FISHING', 'LOTTERY', 'ARCADE'],
    },
    
    amountConfig: {
      type: 'TIERED',
      tiers: [
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 4, vipLevel: 'COPPER' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 4, vipLevel: 'BRONZE' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 6, vipLevel: 'SILVER' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 6, vipLevel: 'GOLD' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 8, vipLevel: 'RUBY' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 8, vipLevel: 'SAPPHIRE' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 8, vipLevel: 'DIAMOND' },
        { minAmount: 500, maxAmount: 999999, bonusPercentage: 8, vipLevel: 'EMPEROR' },
      ],
    },
    
    wageringRequirements: {
      multiplier: 1,
      includeDeposit: false,
      gameContribution: {
        SLOT: 100,
        FISHING: 100,
        LIVE_CASINO: 100,
        SPORTS: 100,
        LOTTERY: 100,
        ARCADE: 100,
      },
    },
    
    timeRestrictions: {
      validityDays: 7,
    },
    
    claimLimits: {
      maxClaimsPerDay: 999, // Unlimited
    },
    
    specialConditions: {
      freeSpinGames: [
        'Golden Bank',
        'Charge Buffalo',
        'Money Coming',
        'Boxing King',
        'Golden Empire',
        'Fortune Gems',
        'Alibaba',
        'Mega Ace',
        'Fortune Gems 2'
      ],
    },
  },
  
  // ২. ১৫০% প্রথম জমার বোনাস
  {
    bonusId: 'FIRST_DEPOSIT_150',
    bonusName: '150% First Deposit Bonus',
    bonusNameBn: '১৫০% প্রথম জমার বোনাস',
    description: 'Get 150% bonus on your first deposit up to ৳1,000',
    descriptionBn: '১৫০% প্রথম জমার বোনাস নিয়ে JILI গেমসের জগতে প্রবেশ করুন সর্বোচ্চ ৳১,০০০ পর্যন্ত',
    bonusType: 'FIRST_DEPOSIT',
    category: 'DEPOSIT',
    isActive: true,
    isAutomatic: false,
    requiresClaim: true,
    
    eligibility: {
      minDepositAmount: 200,
      maxDepositAmount: 25000,
      allowedGameTypes: ['SLOT'],
      allowedProviders: ['JILI'],
    },
    
    amountConfig: {
      type: 'PERCENTAGE',
      percentage: 150,
      minBonusAmount: 100,
      maxBonusAmount: 1000,
    },
    
    wageringRequirements: {
      multiplier: 18,
      includeDeposit: false,
      maxBetAmount: 500,
      gameContribution: {
        SLOT: 100,
        FISHING: 100,
        LIVE_CASINO: 10,
        SPORTS: 50,
      },
    },
    
    timeRestrictions: {
      validityDays: 3,
    },
    
    claimLimits: {
      maxClaimsPerUser: 1,
    },
    
    withdrawalRestrictions: {
      maxWithdrawalAmount: 5000,
      requiresWageringComplete: true,
    },
  },
  
  // ৩. ২০% Money Time দৈনিক ক্যাশব্যাক
  {
    bonusId: 'MONEY_TIME_CASHBACK_20',
    bonusName: '20% Money Time Daily Cashback',
    bonusNameBn: '২০% Money Time দৈনিক ক্যাশব্যাক',
    description: 'Enjoy up to 20% daily cashback on PP Money Time Casino games',
    descriptionBn: 'PP Money Time Casino গেম খেলে উপভোগ করুন ২০% দৈনিক ক্যাশব্যাক',
    bonusType: 'CASHBACK',
    category: 'LOSS',
    isActive: true,
    isAutomatic: true,
    requiresClaim: false,
    
    eligibility: {
      allowedProviders: ['PP'],
      allowedGameTypes: ['SLOT'],
    },
    
    amountConfig: {
      type: 'TIERED',
      tiers: [
        { minAmount: 2000, maxAmount: 10000, bonusPercentage: 5 },
        { minAmount: 10001, maxAmount: 25000, bonusPercentage: 8 },
        { minAmount: 25001, maxAmount: 50000, bonusPercentage: 12 },
        { minAmount: 50001, maxAmount: 100000, bonusPercentage: 15 },
        { minAmount: 100001, maxAmount: 999999999, bonusPercentage: 20 },
      ],
      minBonusAmount: 100,
      maxBonusAmount: 20000,
    },
    
    wageringRequirements: {
      multiplier: 1,
      includeDeposit: false,
    },
    
    timeRestrictions: {
      validityDays: 3,
    },
    
    claimLimits: {
      maxClaimsPerDay: 1,
    },
    
    specialConditions: {
      cashbackOnLossOnly: true,
      cashbackPercentage: 20,
    },
  },
  
  // ৪. ৫৮৮% সাপ্তাহিক স্পোর্টস রিলোড বোনাস
  {
    bonusId: 'WEEKLY_SPORTS_588',
    bonusName: '588% Weekly Sports Reload Bonus',
    bonusNameBn: '৫৮৮% সাপ্তাহিক স্পোর্টস রিলোড বোনাস',
    description: 'Bangladesh Premier League Special 588% Reload Bonus, up to ৳9,000 weekly',
    descriptionBn: 'বাংলাদেশ প্রিমিয়ার লীগ স্পেশাল ৫৮৮% রিলোড বোনাস, সাপ্তাহিক সর্বোচ্চ ৳৯,০০০ পর্যন্ত',
    bonusType: 'WEEKLY_DEPOSIT',
    category: 'DEPOSIT',
    isActive: true,
    isAutomatic: false,
    requiresClaim: true,
    
    eligibility: {
      minDepositAmount: 200,
      maxDepositAmount: 25000,
      allowedGameTypes: ['SPORTS'],
    },
    
    amountConfig: {
      type: 'TIERED',
      tiers: [
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 30, maxBonus: 1300, depositCount: 1 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 45, maxBonus: 1200, depositCount: 2 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 55, maxBonus: 1150, depositCount: 3 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 75, maxBonus: 1100, depositCount: 4 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 98, maxBonus: 1050, depositCount: 5 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 95, maxBonus: 1050, depositCount: 6 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 90, maxBonus: 1000, depositCount: 7 },
        { minAmount: 200, maxAmount: 25000, bonusPercentage: 100, maxBonus: 1150, depositCount: 8 },
      ],
      maxBonusAmount: 9000,
    },
    
    wageringRequirements: {
      multiplier: 18,
      includeDeposit: false,
      gameContribution: {
        SPORTS: 100,
      },
    },
    
    timeRestrictions: {
      validityDays: 3,
    },
    
    claimLimits: {
      maxClaimsPerWeek: 8,
    },
    
    withdrawalRestrictions: {
      maxWithdrawalAmount: 50000,
      requiresWageringComplete: true,
    },
  },
  
  // ৫. দৈনিক ০.৯৮% ইনস্ট্যান্ট রিবেট
  {
    bonusId: 'INSTANT_REBATE_098',
    bonusName: 'Daily 0.98% Instant Rebate',
    bonusNameBn: 'দৈনিক ০.৯৮% ইনস্ট্যান্ট রিবেট',
    description: 'Play, win and earn instant returns. Claim 0.98% rebate daily on Casino games',
    descriptionBn: 'খেলুন, জিতুন এবং তাৎক্ষণিকভাবে রিটার্ন উপার্জন করুন',
    bonusType: 'INSTANT_REBATE',
    category: 'BETTING',
    isActive: true,
    isAutomatic: true,
    requiresClaim: true,
    
    eligibility: {
      minVipLevel: 'BRONZE',
      allowedGameTypes: ['LIVE_CASINO', 'SLOT', 'FISHING'],
    },
    
    amountConfig: {
      type: 'TIERED',
      tiers: [
        { vipLevel: 'BRONZE', bonusPercentage: 0.35 },
        { vipLevel: 'SILVER', bonusPercentage: 0.45 },
        { vipLevel: 'GOLD', bonusPercentage: 0.55 },
        { vipLevel: 'RUBY', bonusPercentage: 0.65 },
        { vipLevel: 'SAPPHIRE', bonusPercentage: 0.75 },
        { vipLevel: 'DIAMOND', bonusPercentage: 0.85 },
        { vipLevel: 'EMPEROR', bonusPercentage: 0.98 },
      ],
      minBonusAmount: 1,
    },
    
    wageringRequirements: {
      multiplier: 1,
      includeDeposit: false,
    },
    
    timeRestrictions: {
      validityDays: 2,
    },
    
    specialConditions: {
      rebatePercentage: 0.98,
      rebateCalculationPeriod: 'DAILY',
    },
  },
  
  // ৬. বন্ধুদের রিবেট কমিশন (3 Tier)
  {
    bonusId: 'REFERRAL_REBATE_3TIER',
    bonusName: 'Friend Rebate Commission (3 Tiers)',
    bonusNameBn: 'বন্ধুদের রিবেট কমিশন (৩ টি স্তর)',
    description: 'Earn unlimited daily commission from referred friends up to 3 tiers',
    descriptionBn: 'রেফার করা বন্ধুদের থেকে দৈনিক সীমাহীন কমিশন উপার্জন করুন ৩ টি স্তর পর্যন্ত',
    bonusType: 'REFERRAL_BONUS',
    category: 'REFERRAL',
    isActive: true,
    isAutomatic: true,
    requiresClaim: true,
    
    eligibility: {
      requiresPhoneVerification: true,
      requiresEmailVerification: true,
    },
    
    amountConfig: {
      type: 'TIERED',
      tiers: [
        // Tier 1
        { minAmount: 100, maxAmount: 10000, bonusPercentage: 0.10, tier: 1 },
        { minAmount: 10001, maxAmount: 30000, bonusPercentage: 0.15, tier: 1 },
        { minAmount: 30001, maxAmount: 999999999, bonusPercentage: 0.20, tier: 1 },
        // Tier 2
        { minAmount: 100, maxAmount: 10000, bonusPercentage: 0.06, tier: 2 },
        { minAmount: 10001, maxAmount: 30000, bonusPercentage: 0.07, tier: 2 },
        { minAmount: 30001, maxAmount: 999999999, bonusPercentage: 0.09, tier: 2 },
        // Tier 3
        { minAmount: 100, maxAmount: 10000, bonusPercentage: 0.02, tier: 3 },
        { minAmount: 10001, maxAmount: 30000, bonusPercentage: 0.03, tier: 3 },
        { minAmount: 30001, maxAmount: 999999999, bonusPercentage: 0.04, tier: 3 },
      ],
    },
    
    wageringRequirements: {
      multiplier: 1,
    },
    
    timeRestrictions: {
      validityHours: 72,
    },
    
    specialConditions: {
      referralTiers: [
        { level: 1, bonusAmount: 288, requiredReferrals: 1 },
        { level: 2, bonusAmount: 118, requiredReferrals: 1 },
      ],
    },
  },
  
  // ৭. সীমাহীন VIP পয়েন্ট
  {
    bonusId: 'UNLIMITED_VIP_POINTS',
    bonusName: 'Unlimited VIP Points',
    bonusNameBn: 'সীমাহীন VIP পয়েন্ট',
    description: 'Earn unlimited VIP points and exchange for real cash',
    descriptionBn: 'আনলিমিটেড VIP পয়েন্ট উপার্জন করুন এবং রিয়েল ক্যাশের জন্য বিনিময় করুন',
    bonusType: 'LOYALTY_BONUS',
    category: 'VIP',
    isActive: true,
    isAutomatic: true,
    requiresClaim: false,
    
    amountConfig: {
      type: 'FIXED',
    },
    
    wageringRequirements: {
      multiplier: 0,
    },
    
    specialConditions: {
      vipPointConversion: {
        SLOT: 100,
        LOTTERY: 100,
        SPORTS: 50,
        LIVE_CASINO: 50,
        FISHING: 50,
        ARCADE: 25,
      },
      vipPointToCash: {
        BRONZE: 1200,
        SILVER: 1100,
        GOLD: 900,
        RUBY: 700,
        SAPPHIRE: 450,
        DIAMOND: 425,
        EMPEROR: 400,
      },
    },
  },
];

/**
 * Setup Bonus Configurations
 * Database এ bonus configurations insert করে
 */
async function setupBonusConfigurations() {
  try {
    console.log('🔧 Setting up Bonus Configurations...');
    
    for (const config of bonusConfigurations) {
      const existing = await BonusConfiguration.findOne({ bonusId: config.bonusId });
      
      if (existing) {
        console.log(`⚠️  Bonus already exists: ${config.bonusId}`);
        // Update existing
        await BonusConfiguration.findOneAndUpdate(
          { bonusId: config.bonusId },
          config,
          { new: true }
        );
        console.log(`✅ Updated: ${config.bonusId}`);
      } else {
        await BonusConfiguration.create(config);
        console.log(`✅ Created: ${config.bonusId}`);
      }
    }
    
    console.log('✅ All Bonus Configurations setup complete');
    return { success: true, count: bonusConfigurations.length };
    
  } catch (error) {
    console.error('❌ Setup Bonus Configurations Error:', error);
    throw error;
  }
}

module.exports = {
  bonusConfigurations,
  setupBonusConfigurations,
};
