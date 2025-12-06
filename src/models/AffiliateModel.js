const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AffiliateModelSchema = new mongoose.Schema({
  // Basic Information
  userId: { type: String, required: true, },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true,  lowercase: true },
  phone: { type: String },
  whatsapp: { type: String },
  password: { type: String, required: true, select: false },
  dateOfBirth: { type: Date },

  // Referral System
  referralCode: { type: String },
    referredBy: { type: String, default: "1" },

  // Status & Verification
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Suspended', 'Pending'] },
  approvedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // Session Management (New Fields)
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

  // Player Statistics
  // activePlayers: { type: Number, default: 0 },
  // totalPlayers: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  // Tier & Settings
  tier: { type: String, default: 'Bronze', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
  commissionRate: { type: Number, default: 0.25 }, // 25% commission
  platformFee: { type: Number, default: 0.20 }, // 20% platform fee

  // Preferences
  language: { type: String, default: 'en' },
  currencyType: { type: String, default: 'BDT' },
  callingCode: { type: String, default: '880' },
  role: { type: String, default: 'Affiliate' },

  // Performance Metrics
  performanceMetrics: {
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalBonuses: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    totalTurnover: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 },
    lifetimeEarnings: { type: Number, default: 0 }
  },

  totalPlayers: {
    type: Number,
    default: 0
  },
  activePlayers: {
    type: Number,
    default: 0
  },
  hierarchy: {
    upline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate'
    },
    downlines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate'
    }]
  },
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
  twoFactorSecret: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
AffiliateModelSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
AffiliateModelSchema.pre('save', async function(next) {

  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await mongoose.model('AffiliateModel').findOne({ referralCode });
      if (!exists) {
        this.referralCode = referralCode;
        isUnique = true;
      }
    }
  }
  next();
});


// Generate referral code if not exists
AffiliateModelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Password comparison method
AffiliateModelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



AffiliateModelSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

// Check if password was changed after token was issued
AffiliateModelSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
AffiliateModelSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Create password reset token
AffiliateModelSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};


// Create 2FA secret
AffiliateModelSchema.methods.create2FASecret = function() {
  const speakeasy = require('speakeasy');
  const secret = speakeasy.generateSecret({
    name: `AffiliateApp (${this.email})`
  });
  
  this.twoFactorSecret = secret.base32;
  this.generateBackupCodes();
  
  return secret;
};

// Verify 2FA token
AffiliateModelSchema.methods.verify2FAToken = function(token) {
  const speakeasy = require('speakeasy');
  
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step (30 seconds) before/after
  });
};

// Add to login history
AffiliateModelSchema.methods.addLoginHistory = function (deviceId, userAgent, ipAddress) {
  this.loginHistory.push({
    deviceId,
    userAgent,
    ipAddress,
    loginTime: new Date()
  });

  // Keep only last 10 login sessions
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
};

// Update logout time in history
AffiliateModelSchema.methods.updateLogoutHistory = function (deviceId) {
  const session = this.loginHistory.find(s => s.deviceId === deviceId && !s.logoutTime);
  if (session) {
    session.logoutTime = new Date();
  }
};

// Indexes for better performance
AffiliateModelSchema.index({ email: 1, unique: true, sparse: true });
AffiliateModelSchema.index({ userId: 1 , unique: true });
AffiliateModelSchema.index({ referralCode: 1 , unique: true, sparse: true });
AffiliateModelSchema.index({ referredBy: 1 });
AffiliateModelSchema.index({ directAdmin: 1 });
AffiliateModelSchema.index({ directSubAdmin: 1 });
AffiliateModelSchema.index({ directAffiliate: 1 });
AffiliateModelSchema.index({ status: 1 });
AffiliateModelSchema.index({ isLoggedIn: 1 });
AffiliateModelSchema.index({ 'currentSession.deviceId': 1 });

module.exports = mongoose.model('AffiliateModel', AffiliateModelSchema);