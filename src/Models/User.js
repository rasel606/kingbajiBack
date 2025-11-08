
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({

//   userId: { type: String, required: true, unique: true },
//   name: { type: String },
//   phone: {
//     type: [
//       {
//         countryCode: { type: String, required: true },
//         number: {
//           type: String,
//           required: true,
//           validate: {
//             validator: v => /^\d{10,15}$/.test(v),
//             message: props => `${props.value} is not a valid phone number!`
//           }
//         },
//         isDefault: { type: Boolean, default: false },
//         verified: { type: Boolean, default: false },
//         verificationCode: String,
//         verificationExpiry: Date
//       }
//     ],
//     validate: [arrayLimit, 'Cannot add more than 3 phone numbers']
//   },
//   apiVerified: { type: Boolean, default: false }, // Add this field
//   email: { type: String },
//   countryCode: { type: String },
//   country: { type: String },
//   password: { type: String, required: true },
//   birthday: { type: Date },
//   referralCode: { type: String, unique: true },
//   referredBy: { type: String, default: "adminmain" },
//   referredbyAgent: { type: String, ref: 'Agent' },
//   referredByAffiliate: { type: String, ref: 'AffiliateModal' },
//   referredbysubAdmin: { type: String, ref: 'SubAdmin' },
//   referredLink: { type: String },
//   levelOneReferrals: [{ type: String, ref: 'User' }],
//   levelTwoReferrals: [{ type: String, ref: 'User' }],
//   levelThreeReferrals: [{ type: String, ref: 'User' }],
//   balance: { type: Number, default: 0 },
//   cashReward: { type: Number, default: 0 },
//   totalBonus: { type: Number, default: 0 },
//   isBirthdayVerified: { type: Boolean, default: false },
//   last_game_id: { type: String },
//   agentId: { type: String },
//   isNameVerified: { type: Boolean, default: false },
//   isVerified: {
//     email: Boolean,
//     phone: Boolean
//   },
//   bonus: {
//     name: { type: String },
//     eligibleGames: [{ type: String, ref: 'Game' }],
//     bonusAmount: { type: Number, default: 0 },
//     wageringRequirement: { type: Number, default: 0 },// বোনাস এমাউন্ট
//     isActive: { type: Boolean, default: true },
//     appliedDate: { type: Date },
//   },
//   // userVipPoint: {
//   //   currentLevel: {
//   //     type: String,
//   //     // required: true,
//   //     enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'],
//   //     default: 'Bronze'
//   //   },
//   //   vipPoints: {
//   //     type: Number,
//   //     default: 0,
//   //     min: 0
//   //   },
//   //   lestAmountConverted: {
//   //     type: Number,
//   //     required: true
//   //   },
//   //   // userVipPointTransactiondate: {
//   //   //   type: Date,
//   //   //   default: Date.now,
//   //   //   index: true
//   //   // },
//   // },
//   role: { type: String, default: 'user' },
//   isActive: { type: Boolean, default: true },
//   timestamp: { type: Date, default: Date.now },
//   onlinestatus: { type: Date, default: Date.now },
//   updatetimestamp: { type: Date, default: Date.now },
//   lastLoginIp: { type: String },
//   lastLoginTime: { type: Date, default: Date.now },
//   lastDepositTime: { type: Date, default: Date.now },
//   lastBetTime: { type: Date, default: Date.now },

// });
// // Validate maximum of 3 phones
// function arrayLimit(val) {
//   return val.length <= 3;
// }

// // Ensure unique phone numbers across all users
// userSchema.index({ 'phone.number': 1 }, { unique: true });

// // Pre-save hook to ensure exactly one default phone
// userSchema.pre('save', function (next) {
//   const defaultPhones = this.phone.filter(p => p.isDefault);
//   if (defaultPhones.length > 1) {
//     return next(new Error('Only one phone can be set as default'));
//   }
//   next();
// });


// const User = mongoose.model("user", userSchema);
// module.exports = User;



// // models/User.js
// // models/User.js
// const mongoose = require("mongoose");
// const userSchema = require("./userSchema");
// const addUserMethods = require("./userMethods");
// const addUserHooks = require("./userHooks");
// const addUserIndexes = require("./userIndexes");

// // Apply all enhancements
// addUserMethods(userSchema);
// addUserHooks(userSchema);
// addUserIndexes(userSchema);

// const User = mongoose.model("User", userSchema);
// module.exports = User;



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
