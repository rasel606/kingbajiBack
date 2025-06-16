const mongoose = require('mongoose');

const UserBonusSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  bonusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus', required: true },
  amount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  turnoverRequirement: { type: Number, required: true },
  completedTurnover: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'expired', 'cancelled', 'pending'], 
    default: 'active' 
  },
  expiryDate: { type: Date, required: true },
  transactionId: { type: String, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserBonus = mongoose.model('UserBonus', UserBonusSchema);
module.exports = UserBonus;