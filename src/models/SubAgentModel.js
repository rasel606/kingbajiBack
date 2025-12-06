const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SubAgentModelSchema = new mongoose.Schema({
  // Basic Information
  userId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  whatsapp: { type: String },
  password: { type: String, required: true, select: false },
  dateOfBirth: { type: Date },

  // Referral System
  referralCode: { type: String },
  referredBy: { type: String, default: "1" },

  // Agent Relationship
  // parentAgent: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Agent',
  //   required: true
  // },

  // SubAgent Specific Fields
  maxAffiliates: { type: Number, default: 20 }, // Maximum affiliates allowed

  // Hierarchy Management
  hierarchy: {
    upline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    affiliates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AffiliateModel'
    }]
  },

  // Status & Verification
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Suspended', 'Pending'] },
  approvedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // Session Management
  currentSession: {
    token: { type: String },
    deviceId: { type: String },
    loginTime: { type: Date },
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  isLoggedIn: { type: Boolean, default: false },
  loginHistory: [{
    deviceId: String,
    userAgent: String,
    ipAddress: String,
    loginTime: Date,
    logoutTime: Date
  }],

  // Balance & Financials
  negativeBalance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  withdrawnBalance: { type: Number, default: 0 },

  // Bank Accounts
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String,
    branch: String,
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // Commission System
  totalCommission: { type: Number, default: 0 },
  pendingCommission: { type: Number, default: 0 },
  availableCommission: { type: Number, default: 0 },
  affiliateCommissionRate: { type: Number, default: 0.20 }, // Commission from affiliates

  // Player Statistics
  totalPlayers: { type: Number, default: 0 },
  activePlayers: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  // Tier & Settings
  tier: { type: String, default: 'Bronze', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
  commissionRate: { type: Number, default: 0.25 }, // 25% commission
  platformFee: { type: Number, default: 0.18 }, // 18% platform fee

  // Preferences
  language: { type: String, default: 'en' },
  currencyType: { type: String, default: 'BDT' },
  callingCode: { type: String, default: '880' },
  role: { type: String, default: 'SubAgent' },

  // Performance Metrics
  performanceMetrics: {
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalBonuses: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    totalTurnover: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 },
    lifetimeEarnings: { type: Number, default: 0 },
    affiliateEarnings: { type: Number, default: 0 }
  },

  // KYC
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    documentType: String,
    documentNumber: String,
    frontPhoto: String,
    backPhoto: String,
    selfiePhoto: String,
    status: String,
    submittedAt: Date
  }],

  // Security
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,

  // SubAgent Specific Permissions
  permissions: {
    canCreateAffiliates: { type: Boolean, default: true },
    canManagePlayers: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canProcessWithdrawals: { type: Boolean, default: false }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
SubAgentModelSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total downline count
// SubAgentModelSchema.virtual('totalDownlines').get(function () {
//   return this.hierarchy.affiliates.length;
// });

// Password hashing and referral code generation middleware
SubAgentModelSchema.pre('save', async function(next) {
  // Generate referral code if not exists
  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const referralCode = 'SUB' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await mongoose.model('SubAgent').findOne({ referralCode });
      if (!exists) {
        this.referralCode = referralCode;
        isUnique = true;
      }
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Password comparison method
SubAgentModelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add similar methods as Affiliate model for security
SubAgentModelSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

SubAgentModelSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Add affiliate to hierarchy
// SubAgentModelSchema.methods.addAffiliate = function(affiliateId) {
//   if (!this.hierarchy.affiliates.includes(affiliateId)) {
//     this.hierarchy.affiliates.push(affiliateId);
//   }
// };

// Indexes
SubAgentModelSchema.index({ email: 1 , unique: true});
SubAgentModelSchema.index({ userId: 1 , unique: true});
SubAgentModelSchema.index({ referralCode: 1,unique: true });
SubAgentModelSchema.index({ referredBy: 1 });
SubAgentModelSchema.index({ parentAgent: 1 });
SubAgentModelSchema.index({ status: 1 });

module.exports = mongoose.model('SubAgent', SubAgentModelSchema);