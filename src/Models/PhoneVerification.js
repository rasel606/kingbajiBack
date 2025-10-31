// src/Models/PhoneVerification.js
const mongoose = require('mongoose');

const phoneVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  phoneNumber: { type: String, required: true, index: true },
  verificationCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  isUsed: { type: Boolean, default: false },
  ipAddress: { type: String }
}, { timestamps: true });

// TTL index (auto delete expired OTP)
phoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Custom static method
phoneVerificationSchema.statics.findValidCode = function(phoneNumber, code) {
  return this.findOne({
    phoneNumber,
    verificationCode: code,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  });
};

module.exports = mongoose.model('PhoneVerification', phoneVerificationSchema);
