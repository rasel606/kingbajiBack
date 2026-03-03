const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  verificationCode: {
    type: String,
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
  expiresAt: {
    type: Date,
    required: true
  },
  ipAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
emailVerificationSchema.index({ email: 1, createdAt: -1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find valid verification code
emailVerificationSchema.statics.findValidCode = async function(email, code) {
  return await this.findOne({
    email: email.toLowerCase(),
    verificationCode: code,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: this.maxAttempts }
  });
};

// Static method to check recent attempts
emailVerificationSchema.statics.getRecentAttemptsCount = async function(email, minutes = 10) {
  const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);
  return await this.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: timeThreshold }
  });
};

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);