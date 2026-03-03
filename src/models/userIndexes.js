module.exports = function addUserIndexes(userSchema) {
  userSchema.index({ userId: 1 }, { unique: true });

  // Email index সম্পূর্ণ remove করলাম
  // userSchema.index({ email: 1 }, { sparse: true });

  userSchema.index(
    { "phone.number": 1 },
    {
      unique: true,
      sparse: true,
    }
  );

  userSchema.index({ referralCode: 1 }, { sparse: true });
  userSchema.index({ referredBy: 1 });
  userSchema.index({ role: 1 });
  userSchema.index({ isActive: 1 });
  userSchema.index({ lastLoginTime: -1 });
  userSchema.index({ balance: -1 });
  userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });
  // In your user model or a separate migration:
  // userSchema.index({ userId: 1, isBirthdayVerified: 1 });
  // userSchema.index({ birthday: 1, isBirthdayVerified: 1 });

  console.log("✅ User indexes applied (email index removed)");
};
