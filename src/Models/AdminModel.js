
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminModelSchema = new mongoose.Schema({
  // Basic Information
  email: { type: String, required: true,  lowercase: true },
  firstName: { type: String },
  lastName: { type: String },
  mobile: { type: String, unique: true, sparse: true },
  countryCode: { type: String, default: '+880' },
  password: { type: String, required: true, select: false },
  
  // Role & Permissions
  role: { type: String, default: "Admin", enum: ["Admin", "SuperAdmin"] },
  permissions: [{
    module: String,
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  }],
  
  // Referral System
  userId: { type: String,},
  referralCode: { type: String },
  referredBy: { type: String },
  
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
  
  // Status & Activity
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Suspended'] },
  lastLogin: { type: Date },
  lastActivity: { type: Date },
  
  // Financials
  balance: { type: Number, default: 0 },
  
  // Security
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  twoFactorBackupCodes: [{
    code: String,
    used: { type: Boolean, default: false },
    usedAt: Date
  }],
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  securityQuestions: [{
    question: String,
    answer: String
  }]

}, {
  timestamps: true,
  versionKey: false
});

// Virtual for full name
AdminModelSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Password hashing middleware
AdminModelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Generate userId and referralCode if not exists
AdminModelSchema.pre('save', async function(next) {
  if (!this.userId) {
    let isUnique = false;
    while (!isUnique) {
      const newUserId = 'ADM' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await mongoose.model('AdminModel').findOne({ userId: newUserId });
      if (!exists) {
        this.userId = newUserId;
        isUnique = true;
      }
    }
  }
  
  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await mongoose.model('AdminModel').findOne({ referralCode });
      if (!exists) {
        this.referralCode = referralCode;
        isUnique = true;
      }
    }
  }
  next();
});

// Password comparison method
AdminModelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
AdminModelSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
AdminModelSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Add to login history
AdminModelSchema.methods.addLoginHistory = function(deviceId, userAgent, ipAddress) {
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
// Create 2FA secret
AdminModelSchema.methods.create2FASecret = function() {
  const speakeasy = require('speakeasy');
  const secret = speakeasy.generateSecret({
    name: `AdminApp (${this.email})`
  });
  
  this.twoFactorSecret = secret.base32;
  this.generateBackupCodes();
  
  return secret;
};

// Verify 2FA token
AdminModelSchema.methods.verify2FAToken = function(token) {
  const speakeasy = require('speakeasy');
  
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step (30 seconds) before/after
  });
};
// Update logout time in history
AdminModelSchema.methods.updateLogoutHistory = function(deviceId) {
  const session = this.loginHistory.find(s => s.deviceId === deviceId && !s.logoutTime);
  if (session) {
    session.logoutTime = new Date();
  }
};

// Indexes
AdminModelSchema.index({ email: 1,unique: true, sparse: true });
AdminModelSchema.index({ userId: 1, unique: true, sparse: true });
AdminModelSchema.index({ referralCode: 1, unique: true, sparse: true });
AdminModelSchema.index({ referredBy: 1 });
AdminModelSchema.index({ role: 1 });
AdminModelSchema.index({ status: 1 });











AdminModelSchema.index({ isLoggedIn: 1 });

module.exports = mongoose.model("AdminModel", AdminModelSchema);