// models/user/userHooks.js
module.exports = function addUserHooks(userSchema) {
  // ensure one default phone only
  userSchema.pre("save", function (next) {
    const defaults = this.phone.filter(p => p.isDefault);
    if (defaults.length > 1) return next(new Error("Only one phone can be default"));
    next();
  });
};
