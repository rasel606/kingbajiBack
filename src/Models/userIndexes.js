// // models/user/userIndexes.js
// module.exports = function addUserIndexes(userSchema) {
//   userSchema.index({ "phone.number": 1 }, { unique: true, sparse: true });
// };

module.exports = function addUserIndexes(userSchema) {
  userSchema.index({ "phone.number": 1 }, { unique: true, sparse: true });
  userSchema.index({ email: 1 }, { unique: true, sparse: true });
  userSchema.index({ username: 1 }, { unique: true, sparse: true });
  userSchema.index({ referralCode: 1 });
  userSchema.index({ role: 1 });
  userSchema.index({ isActive: 1 });
  userSchema.index({ "lastLoginTime": -1 });
  userSchema.index({ country: 1 });
  userSchema.index({ agentId: 1 });
  userSchema.index({ "bonus.isActive": 1 });
};