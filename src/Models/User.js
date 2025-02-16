
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    
  userId: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  countryCode: { type: String },
  country: { type: String },
  password: { type: String, required: true },
  birthday: { type: Date },
  referredCode: { type: String, unique: true },
  referredbyCode: {type:String},
  referredbyAgent: {type:String},
  referredbyAffiliate: {type:String},
  referredLink: {type:String},
  balance: { type: Number, default: 0 ,enum: [0, 1, 2]},
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isBirthdayVerified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  lest_game_id: { type: String },
});
const User = mongoose.model("user", userSchema)
module.exports = User