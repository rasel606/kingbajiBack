const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AgentModelSchema = new mongoose.Schema({
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

  // Agent Specific Fields
  agentType: {
    type: String,
    default: 'Agent',
    enum: ['MasterAgent', 'SuperAgent', 'Agent']
  },
  maxSubAgents: { type: Number, default: 10 }, // Maximum sub-agents allowed
  maxAffiliates: { type: Number, default: 50 }, // Maximum affiliates under this agent

  // Hierarchy Management
  hierarchy: {
    upline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    downlines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    }],
    subAgents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAgent'
    }],
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
  subAgentCommissionRate: { type: Number, default: 0.15 }, // Commission from sub-agents
  affiliateCommissionRate: { type: Number, default: 0.10 }, // Commission from affiliates

  // Player Statistics
  totalPlayers: { type: Number, default: 0 },
  activePlayers: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  // Tier & Settings
  tier: { type: String, default: 'Bronze', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
  commissionRate: { type: Number, default: 0.30 }, // 30% commission
  platformFee: { type: Number, default: 0.15 }, // 15% platform fee

  // Preferences
  language: { type: String, default: 'en' },
  currencyType: { type: String, default: 'BDT' },
  callingCode: { type: String, default: '880' },
  role: { type: String, default: 'Agent' },

  // Performance Metrics
  performanceMetrics: {
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalBonuses: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    totalTurnover: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 },
    lifetimeEarnings: { type: Number, default: 0 },
    subAgentEarnings: { type: Number, default: 0 },
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

  // Agent Specific Permissions
  permissions: {
    canCreateSubAgents: { type: Boolean, default: true },
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
AgentModelSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total downline count
AgentModelSchema.virtual('totalDownlines').get(function () {
  return this.hierarchy.subAgents.length + this.hierarchy.affiliates.length;
});

// Password hashing and referral code generation middleware
AgentModelSchema.pre('save', async function (next) {
  // Generate referral code if not exists
  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const referralCode = 'AGT' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await mongoose.model('Agent').findOne({ referralCode });
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
AgentModelSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add similar methods as Affiliate model for security
AgentModelSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

AgentModelSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Add sub-agent to hierarchy
AgentModelSchema.methods.addSubAgent = function (subAgentId) {
  if (!this.hierarchy.subAgents.includes(subAgentId)) {
    this.hierarchy.subAgents.push(subAgentId);
  }
};

// Add affiliate to hierarchy
AgentModelSchema.methods.addAffiliate = function (affiliateId) {
  if (!this.hierarchy.affiliates.includes(affiliateId)) {
    this.hierarchy.affiliates.push(affiliateId);
  }
};

// Indexes
AgentModelSchema.index({ email: 1, unique: true });
AgentModelSchema.index({ userId: 1, unique: true });
AgentModelSchema.index({ referralCode: 1, unique: true });
AgentModelSchema.index({ referredBy: 1 });
AgentModelSchema.index({ status: 1 });
AgentModelSchema.index({ 'hierarchy.upline': 1 });
AgentModelSchema.index({ agentType: 1 });

module.exports = mongoose.model('Agent', AgentModelSchema);