
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },
  name: { type: String },
  phone: {
    type: [{
      countryCode: { type: String, required: true },
      number: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v) {
            return /^\d{10,15}$/.test(v); // Basic phone number validation
          },
          message: props => `${props.value} is not a valid phone number!`
        }
      },
      isDefault: { type: Boolean, default: false },
      verified: { type: Boolean, default: false },
      verificationCode: String,
    verificationExpiry: Date
    }],
    validate: [arrayLimit, 'Cannot add more than 3 phone numbers']
  },
  apiVerified: { type: Boolean, default: false }, // Add this field
  email: { type: String },
  countryCode: { type: String },
  country: { type: String },
  password: { type: String, required: true },
  birthday: { type: Date },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  referredbyAgent: { type: String },
  referredbyAffiliate: { type: String },
  referredLink: { type: String },
  levelOneReferrals: [{ type: String, ref: 'User' }],
  levelTwoReferrals: [{ type: String, ref: 'User' }],
  levelThreeReferrals: [{ type: String, ref: 'User' }],
  balance: { type: Number, default: 0 },
  cashReward: { type: Number, default: 0 },
  totalBonus: { type: Number, default: 0 },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isBirthdayVerified: { type: Boolean, default: false },
  last_game_id: { type: String },
  agentId: { type: String },
  isVerified: {
    email: Boolean, 
    phone: Boolean
  },
  bonus: {
    name: { type: String },
    eligibleGames: [{ type: String, ref: 'Game' }],
    bonusAmount: { type: Number, default: 0 },
    wageringRequirement: { type: Number, default: 0 },// বোনাস এমাউন্ট
    isActive: { type: Boolean, default: true },
    appliedDate: { type: Date },
  },
  isActive: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now }
});
// Validate maximum of 3 phones
function arrayLimit(val) {
  return val.length <= 3;
}

// Ensure unique phone numbers across all users
userSchema.index({ 'phone.number': 1 }, { unique: true });

// Pre-save hook to ensure exactly one default phone
userSchema.pre('save', function(next) {
  const defaultPhones = this.phone.filter(p => p.isDefault);
  if (defaultPhones.length > 1) {
    const err = new Error('Exactly one phone must be set as default');
    return next(err);
  }
  next();
});

const User = mongoose.model("user", userSchema);
module.exports = User;