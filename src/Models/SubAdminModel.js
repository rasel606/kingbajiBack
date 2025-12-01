const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SubAdminModelSchema = new mongoose.Schema({
  // Basic Information
  email: { type: String, required: true, lowercase: true, unique: true }, // Added unique
  firstName: { type: String, required: true },
  lastName: { type: String },
  mobile: { type: String },
  countryCode: { type: String, default: '+880' },
  password: { type: String, required: true, select: false },
  
  // Identification
  userId: { type: String, unique: true }, // Added unique
  referralCode: { type: String, unique: true }, // ADDED THIS FIELD
  
  // Role & Permissions
  role: { type: String, default: "SubAdmin", enum: ["SubAdmin"] },
  permissions: [{
    module: { 
      type: String, 
      enum: [
        'users', 'affiliates', 'transactions', 'betting', 
        'reports', 'settings', 'bonus', 'withdrawals'
      ] 
    },
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminModel' },
  
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
  
  // Access Control
  accessLevel: { 
    type: String, 
    default: 'Limited', 
    enum: ['Full', 'Limited', 'ViewOnly'] 
  },
  allowedIPs: [String],
  
  // Security
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  twoFactorBackupCodes: [{
    code: String,
    used: { type: Boolean, default: false },
    usedAt: Date
  }],
  securityQuestions: [{
    question: String,
    answer: String
  }]

}, {
  timestamps: true,
  versionKey: false
});

// Virtual for full name
SubAdminModelSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Password hashing middleware
SubAdminModelSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Generate userId and referralCode if not exists
SubAdminModelSchema.pre('save', async function(next) {
  try {
    // Generate referral code if not exists
    if (!this.referralCode) {
      let isUnique = false;
      let referralCode;
      
      while (!isUnique) {
        referralCode = 'SUB' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const exists = await this.constructor.findOne({ referralCode });
        if (!exists) {
          isUnique = true;
        }
      }
      this.referralCode = referralCode;
    }
    
    // Generate userId if not exists
    if (!this.userId) {
      let isUnique = false;
      let newUserId;
      
      while (!isUnique) {
        newUserId = 'SUB' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const exists = await this.constructor.findOne({ userId: newUserId });
        if (!exists) {
          isUnique = true;
        }
      }
      this.userId = newUserId;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
SubAdminModelSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
SubAdminModelSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Check if account is locked
SubAdminModelSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
SubAdminModelSchema.methods.incrementLoginAttempts = async function() {
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

// Create password reset token
SubAdminModelSchema.methods.createPasswordResetToken = function() {
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
SubAdminModelSchema.methods.addLoginHistory = function(deviceId, userAgent, ipAddress) {
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
SubAdminModelSchema.methods.updateLogoutHistory = function(deviceId) {
  const session = this.loginHistory.find(s => s.deviceId === deviceId && !s.logoutTime);
  if (session) {
    session.logoutTime = new Date();
  }
};

// Generate 2FA backup codes
SubAdminModelSchema.methods.generateBackupCodes = function() {
  const crypto = require('crypto');
  const codes = [];
  
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code,
      used: false
    });
  }
  
  this.twoFactorBackupCodes = codes;
  return codes;
};

// Create 2FA secret
SubAdminModelSchema.methods.create2FASecret = function() {
  const speakeasy = require('speakeasy');
  const secret = speakeasy.generateSecret({
    name: `AdminApp (${this.email})`
  });
  
  this.twoFactorSecret = secret.base32;
  this.generateBackupCodes();
  
  return secret;
};

// Verify 2FA token
SubAdminModelSchema.methods.verify2FAToken = function(token) {
  const speakeasy = require('speakeasy');
  
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step (30 seconds) before/after
  });
};

// Check IP access
SubAdminModelSchema.methods.isIPAllowed = function(ip) {
  if (this.allowedIPs.length === 0) return true;
  return this.allowedIPs.includes(ip);
};

// Verify backup code
SubAdminModelSchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.twoFactorBackupCodes.find(
    bc => bc.code === code && !bc.used
  );
  
  if (backupCode) {
    backupCode.used = true;
    backupCode.usedAt = new Date();
    return true;
  }
  
  return false;
};

// Indexes
SubAdminModelSchema.index({ email: 1 ,unique: true });
SubAdminModelSchema.index({ userId: 1 ,unique: true });
SubAdminModelSchema.index({ referralCode: 1 ,unique: true }); // Added index
SubAdminModelSchema.index({ role: 1 });
SubAdminModelSchema.index({ status: 1 });
SubAdminModelSchema.index({ isLoggedIn: 1 });
SubAdminModelSchema.index({ createdBy: 1 });

module.exports = mongoose.model("SubAdminModel", SubAdminModelSchema);