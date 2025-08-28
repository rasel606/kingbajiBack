const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    referralBy: { type: String },
    referralCode: { type: String, unique: true, minlength: 2, maxlength: 10 },
    SubAdminId: { type: String, unique: true, minlength: 6, maxlength: 10},
    user_referredLink: { type: String, sparse: true },
    agent_referredLink: { type: String, sparse: true, default: 1 },
    affiliate_referredLink: { type: String, sparse: true, default: 1 },
    countryCode: { type: String },
    phone: { type: String },
    role: { type: String, default: "subAdmin" },
    userId: { type: String, default: "subAdmin" },
    users: [{ type: String, ref: 'User' }],
    Agent: [{ type: String, ref: 'Agent' }],
    Affiliate: [{ type: String, ref: 'Affiliate' }],
    userByAffiliate: [{ type: String, ref: 'User' }],
    affiliateRefs: [{ type: String, ref: 'AffiliateUser' }],
    IsActive: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    updatetimestamp: { type: Date, default: Date.now },
  },
  // Automatically adds createdAt & updatedAt timestamps
);

const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);

module.exports = SubAdmin;
