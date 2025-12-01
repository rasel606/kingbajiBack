
const mongoose = require("mongoose");
const userSchema = require("./userSchema");

// Simple referral code generator
function generateReferralCode() {
  return 'REF' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Add methods directly to schema
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
  
  return jwt.sign(
    { 
      userId: this.userId,
      role: this.role 
    }, 
    JWT_SECRET, 
    { expiresIn: "2d" }
  );
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add pre-save hook directly
userSchema.pre("save", async function (next) {
  // Password hashing
  if (this.isModified("password")) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  // Referral code generation
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  
  // Update timestamp
  this.updatetimestamp = new Date();
  
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
