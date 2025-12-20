const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // General Settings
  siteName: { type: String, default: 'KingBaji' },
  siteUrl: { type: String, default: 'https://kingbaji.com' },
  siteLogo: String,
  siteFavicon: String,
  siteCurrency: { type: String, default: 'BDT' },
  currencySymbol: { type: String, default: '৳' },
  
  // Maintenance Mode
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: String,
  allowedIps: [String],
  
  // Deposit Settings
  minDeposit: { type: Number, default: 100 },
  maxDeposit: { type: Number, default: 50000 },
  depositMethods: [{
    name: String,
    type: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    minAmount: Number,
    maxAmount: Number,
    feePercentage: { type: Number, default: 0 },
    processingTime: String,
    instructions: String,
    accountDetails: mongoose.Schema.Types.Mixed
  }],
  
  // Withdrawal Settings
  minWithdrawal: { type: Number, default: 500 },
  maxWithdrawal: { type: Number, default: 50000 },
  withdrawalMethods: [{
    name: String,
    type: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    minAmount: Number,
    maxAmount: Number,
    feePercentage: { type: Number, default: 0 },
    processingTime: String,
    dailyLimit: Number
  }],
  
  // Bonus Settings
  referralSettings: {
    level1Percentage: { type: Number, default: 0.2 },
    level2Percentage: { type: Number, default: 0.07 },
    level3Percentage: { type: Number, default: 0.03 },
    minDepositForBonus: { type: Number, default: 2000 },
    minTurnoverForBonus: { type: Number, default: 5000 },
    bonusValidityDays: { type: Number, default: 7 }
  },
  
  // VIP Settings
  vipSettings: [{
    level: { type: String, required: true },
    minTurnover: { type: Number, required: true },
    cashbackPercentage: { type: Number, default: 0 },
    birthdayBonus: { type: Number, default: 0 },
    monthlyBonus: { type: Number, default: 0 },
    withdrawalLimit: { type: Number, default: 0 },
    personalManager: { type: Boolean, default: false },
    specialGifts: { type: Boolean, default: false }
  }],
  
  // Commission Settings
  commissionTiers: [{
    tier: { type: Number, required: true },
    minTurnover: { type: Number, required: true },
    maxTurnover: { type: Number, required: true },
    level1Percentage: { type: Number, default: 0 },
    level2Percentage: { type: Number, default: 0 },
    level3Percentage: { type: Number, default: 0 }
  }],
  
  // SMS & Email Settings
  smsSettings: {
    provider: String,
    apiKey: String,
    senderId: String,
    otpTemplate: String,
    depositTemplate: String,
    withdrawalTemplate: String
  },
  
  emailSettings: {
    provider: String,
    host: String,
    port: Number,
    secure: Boolean,
    user: String,
    password: String,
    fromEmail: String,
    fromName: String
  },
  
  // API Settings
  apiSettings: {
    operatorCode: String,
    secretKey: String,
    apiUrl: String,
    syncInterval: { type: Number, default: 60 } // in seconds
  },
  
  // Security Settings
  securitySettings: {
    maxLoginAttempts: { type: Number, default: 5 },
    lockDuration: { type: Number, default: 30 }, // in minutes
    sessionTimeout: { type: Number, default: 8 }, // in hours
    require2FA: { type: Boolean, default: false },
    allowedCountries: [String],
    blockedIps: [String]
  },
  
  // Notification Settings
  notificationSettings: {
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    telegramBot: { type: Boolean, default: false },
    telegramToken: String,
    telegramChatId: String
  },
  
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);