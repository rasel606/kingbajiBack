const mongoose = require('mongoose');

const AffiliateUserWithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateModel', required: true },
  applicationId: { type: String, unique: true },
  applyTime: { type: Date, default: Date.now },
  currency: { type: String, required: true, default: 'BDT' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Rejected'], default: 'Pending' },
  bankId: { type: mongoose.Schema.Types.ObjectId },
  bankName: String,
  branch: String,
  bankCardNo: String,
  playerId: { type: String, ref: 'User' },
  playerName: String,
  processedAt: Date,
  completedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

AffiliateUserWithdrawalSchema.pre('save', function (next) {
  if (!this.applicationId) {
    this.applicationId = `WD${Date.now().toString().slice(-8)}`;
  }
  next();
});

module.exports = mongoose.model('AffiliateUserWithdrawal', AffiliateUserWithdrawalSchema);