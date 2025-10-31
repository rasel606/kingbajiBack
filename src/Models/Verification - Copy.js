const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactType: { type: String, enum: ['email', 'phone'], required: true },
  contactValue: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  verifiedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Verification', VerificationSchema);