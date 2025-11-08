// // models/user/userHooks.js
// module.exports = function addUserHooks(userSchema) {
//   // ensure one default phone only
//   userSchema.pre("save", function (next) {
//     const defaults = this.phone.filter(p => p.isDefault);
//     if (defaults.length > 1) return next(new Error("Only one phone can be default"));
//     next();
//   });
// };
const bcrypt = require('bcryptjs');

module.exports = function addUserHooks(userSchema) {
  
  // Pre-save hook for password hashing
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
      this.password = await bcrypt.hash(this.password, 12);
      next();
    } catch (error) {
      next(error);
    }
  });

  // Generate referral code if not exists - FIXED VERSION
  userSchema.pre("save", async function (next) {
    if (!this.referralCode) {
      let referralCode;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        // Simple referral code generation without external module
        referralCode = generateSimpleReferralCode();
        attempts++;
        
        if (attempts > maxAttempts) {
          return next(new Error('Failed to generate unique referral code'));
        }
        
        // Check if referral code already exists
        const existingUser = await this.constructor.findOne({ referralCode });
        if (!existingUser) {
          break; // Unique code found
        }
      } while (true);
      
      this.referralCode = referralCode;
    }
    next();
  });

  // Update timestamp before save
  userSchema.pre("save", function (next) {
    this.updatetimestamp = new Date();
    next();
  });

  // Ensure one default phone only
  userSchema.pre("save", function (next) {
    if (this.phone && this.phone.length > 0) {
      const defaults = this.phone.filter(p => p.isDefault);
      
      if (defaults.length > 1) {
        return next(new Error("Only one phone can be default"));
      }
      
      // Ensure at least one phone is default
      if (defaults.length === 0 && this.phone.length > 0) {
        this.phone[0].isDefault = true;
      }
    }
    next();
  });
};

// Simple referral code generator without external module
function generateSimpleReferralCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}