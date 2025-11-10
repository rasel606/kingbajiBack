const mongoose = require('mongoose');

const phoneVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  phone: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  purpose: {
    type: String,
    enum: ['registration', 'verification', 'reset', 'login'],
    default: 'verification'
  }
}, {
  timestamps: true
});

// Index for faster queries
phoneVerificationSchema.index({ phone: 1, verificationCode: 1 });
phoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
phoneVerificationSchema.index({ userId: 1 });

// Static method to find valid verification code
phoneVerificationSchema.statics.findValidCode = async function(phone, code) {
  return await this.findOne({
    phone,
    verificationCode: code,
    expiresAt: { $gt: new Date() },
    isUsed: false,
    attempts: { $lt: this.maxAttempts }
  });
};

// Method to check if code is expired
phoneVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to increment attempts
phoneVerificationSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

// Method to mark as used
phoneVerificationSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  return await this.save();
};

module.exports = mongoose.model('PhoneVerification', phoneVerificationSchema);