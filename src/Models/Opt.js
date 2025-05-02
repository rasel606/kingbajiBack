const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: { 
      type: String, 
      required: true, 
      ref: 'User'  // Reference to User model's userId field
    },
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  });
  
  const OTP = mongoose.model("OTP", otpSchema);
  
  module.exports = OTP;