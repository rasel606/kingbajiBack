// models/user/userIndexes.js
module.exports = function addUserIndexes(userSchema) {
  userSchema.index({ "phone.number": 1 }, { unique: true, sparse: true });
};
