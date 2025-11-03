const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  firstName: { type: String },
  mobile: { type: String, unique: true, sparse: true, required: false },
  countryCode: { type: String },
  balance: { type: Number, default: 0 },
  referralCode: { type: String ,default:null },
  password: { type: String, required: true },
  role: { type: String, default: "Admin", enum: ["Admin", "SubAdmin", "User"] },
  userId: { type: String, unique: true },
  refeeredBy: { type: String },
  lastLogin: { type: Date } // ✅ added
}, {
  timestamps: true,
  versionKey: false
});

// Hash password before save
// AdminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

const AdminModel = mongoose.model("AdminModel", AdminSchema);
module.exports = AdminModel;
