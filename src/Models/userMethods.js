

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

module.exports = function addUserMethods(userSchema) {


  userSchema.methods.changePassword = async function (currentPassword, newPassword) {
  // Verify current password
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Validate new password
  if (newPassword.length < 6 || newPassword.length > 20) {
    throw new Error('Password must be between 6 and 20 characters');
  }
  
  if (!/[a-zA-Z]/.test(newPassword)) {
    throw new Error('Password must contain at least one letter');
  }
  
  if (!/\d/.test(newPassword)) {
    throw new Error('Password must contain at least one number');
  }
  
  // Update password
  this.password = newPassword;
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  
  return this.save();
};


  // Phone management
  userSchema.methods.addPhoneNumber = async function (countryCode, number, isDefault = false) {
    if (this.phone.length >= 3) {
      throw new Error("Cannot add more than 3 phone numbers");
    }

    if (this.phone.find(p => p.number === number)) {
      throw new Error("Phone number already exists");
    }

    const newPhone = { countryCode, number, isDefault, verified: false };

    if (isDefault) {
      this.phone.forEach(p => p.isDefault = false);
    }

    this.phone.push(newPhone);
    return this.save();
  };

  userSchema.methods.verifyPhone = async function (number) {
    const phone = this.phone.find(p => p.number === number);
    if (!phone) throw new Error("Phone not found");

    phone.verified = true;
    phone.verificationCode = undefined;
    phone.verificationExpiry = undefined;
    this.isVerified.phone = this.phone.some(p => p.verified);
    return this.save();
  };

  // Password methods
  userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Authentication
  userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
      {
        userId: this.userId,
        role: this.role
      },
      JWT_SECRET,
      { expiresIn: "2d" }
    );
  };

  // Account lock methods
  userSchema.methods.incrementLoginAttempts = async function () {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    return this.save();
  };

  userSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
  };

  userSchema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
  };

  // Password reset
  userSchema.methods.generatePasswordReset = function () {
    this.resetCode = crypto.randomInt(100000, 999999).toString();
    this.resetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return this.save();
  };

  userSchema.methods.verifyResetCode = function (code) {
    return this.resetCode === code && this.resetExpiry > Date.now();
  };

  userSchema.methods.resetPassword = async function (newPassword) {
    this.password = newPassword;
    this.resetCode = undefined;
    this.resetExpiry = undefined;
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
  };

  // Referral methods
  userSchema.methods.addReferral = function (referredUserId, level = 1) {
    if (level === 1) {
      if (!this.levelOneReferrals.includes(referredUserId)) {
        this.levelOneReferrals.push(referredUserId);
      }
    } else if (level === 2) {
      if (!this.levelTwoReferrals.includes(referredUserId)) {
        this.levelTwoReferrals.push(referredUserId);
      }
    } else if (level === 3) {
      if (!this.levelThreeReferrals.includes(referredUserId)) {
        this.levelThreeReferrals.push(referredUserId);
      }
    }
    return this.save();
  };

  // Balance methods
  userSchema.methods.addBalance = function (amount) {
    this.balance += amount;
    return this.save();
  };

  userSchema.methods.deductBalance = function (amount) {
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    return this.save();
  };
  // In your User model (likely in models/User.js), ensure you have:


  // Update login info
  userSchema.methods.updateLoginInfo = function (ipAddress) {
    this.lastLoginIp = ipAddress;
    this.lastLoginTime = new Date();
    this.onlinestatus = new Date();
    return this.save();
  };
};