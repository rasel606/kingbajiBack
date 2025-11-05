// // models/user/userMethods.js
// module.exports = function addUserMethods(userSchema) {
//   userSchema.methods.addPhoneNumber = function (countryCode, number, isDefault = false) {
//     if (this.phone.length >= 3) throw new Error("Cannot add more than 3 phone numbers");
//     if (this.phone.find(p => p.number === number)) throw new Error("Phone number already exists");

//     const newPhone = { countryCode, number, isDefault, verified: false };
//     if (isDefault) this.phone.forEach(p => (p.isDefault = false));
//     this.phone.push(newPhone);
//     return this.save();
//   };

//   userSchema.methods.verifyPhone = function (number) {
//     const phone = this.phone.find(p => p.number === number);
//     if (!phone) throw new Error("Phone not found");
//     phone.verified = true;
//     phone.verificationCode = undefined;
//     phone.verificationExpiry = undefined;
//     this.isVerified.phone = this.phone.some(p => p.verified);
//     return this.save();
//   };
// };


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = function addUserMethods(userSchema) {
  
  // Phone number management
  userSchema.methods.addPhoneNumber = function (countryCode, number, isDefault = false) {
    if (this.phone.length >= 3) throw new Error("Cannot add more than 3 phone numbers");
    if (this.phone.find(p => p.number === number)) throw new Error("Phone number already exists");

    const newPhone = { countryCode, number, isDefault, verified: false };
    if (isDefault) this.phone.forEach(p => (p.isDefault = false));
    this.phone.push(newPhone);
    return this.save();
  };

  userSchema.methods.verifyPhone = function (number) {
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

  userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
      { 
        userId: this.userId, 
        email: this.email,
        role: this.role 
      }, 
      process.env.JWT_SECRET || 'your-fallback-secret', 
      { expiresIn: '2d' }
    );
  };

  // Account lock methods
  userSchema.methods.incrementLoginAttempts = function () {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
    }
    return this.save();
  };

  userSchema.methods.resetLoginAttempts = function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
  };

  userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

  // Bonus methods
  userSchema.methods.applyBonus = function (bonusData) {
    this.bonus = {
      ...bonusData,
      appliedDate: new Date(),
      isActive: true
    };
    this.totalBonus += bonusData.bonusAmount || 0;
    return this.save();
  };

  userSchema.methods.deactivateBonus = function () {
    this.bonus.isActive = false;
    return this.save();
  };
};