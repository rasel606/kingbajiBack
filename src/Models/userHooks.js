// // models/user/userHooks.js
// module.exports = function addUserHooks(userSchema) {
//   // ensure one default phone only
//   userSchema.pre("save", function (next) {
//     const defaults = this.phone.filter(p => p.isDefault);
//     if (defaults.length > 1) return next(new Error("Only one phone can be default"));
//     next();
//   });
// };


const bcrypt = require('bcrypt');

module.exports = function addUserHooks(userSchema) {
  
  // Hash password before saving
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  // Ensure one default phone only
  userSchema.pre("save", function (next) {
    if (this.phone && this.phone.length > 0) {
      const defaults = this.phone.filter(p => p.isDefault);
      if (defaults.length > 1) {
        return next(new Error("Only one phone can be default"));
      }
    }
    next();
  });

  // Generate referral code before saving if not exists
  userSchema.pre('save', function (next) {
    if (!this.referralCode) {
      this.referralCode = generateReferralCode(this.userId);
    }
    next();
  });

  // Update timestamps
  userSchema.pre('save', function (next) {
    this.updatetimestamp = new Date();
    next();
  });
};

function generateReferralCode(userId) {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${userId.substring(0, 3)}${random}`;
}