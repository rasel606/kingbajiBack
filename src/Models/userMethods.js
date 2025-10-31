// models/user/userMethods.js
module.exports = function addUserMethods(userSchema) {
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
};
