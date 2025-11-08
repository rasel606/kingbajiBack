// const mongoose = require("mongoose");

// const otpSchema = new mongoose.Schema({
//     userId: { 
//       type: String, 
//       required: true, 
//       ref: 'User'  // Reference to User model's userId field
//     },
//     email: { type: String, required: true },
//     otp: { type: String, required: true },
//     expiresAt: { type: Date, required: true },
//   });
  
//   const OTP = mongoose.model("OTP", otpSchema);
  
//   module.exports = OTP;

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'reset', 'verification'],
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
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// TTL index for auto-expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index
otpSchema.index({ phone: 1, purpose: 1 });

// Methods
otpSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

otpSchema.methods.verify = function() {
  this.verified = true;
  return this.save();
};

module.exports = mongoose.model('OTP', otpSchema);