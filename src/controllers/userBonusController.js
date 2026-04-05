const BonusWallet = require('../models/BonusWallet');
const BonusWalletTransaction = require('../models/BonusWalletTransaction');
const asyncHandler = require('express-async-handler');

exports.listUserBonuses = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const bonuses = await BonusWallet.find({ userId, status: { $in: ['ACTIVE', 'PENDING'] } }).sort({ createdAt: -1 });
  res.json({ success: true, bonuses });
});

exports.claimBonus = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { bonusId } = req.body;
  const bonus = await BonusWallet.findOne({ userId, _id: bonusId, status: 'ACTIVE' });
  if (!bonus) return res.status(404).json({ success: false, message: 'Bonus not found or not active' });
  if (bonus.locked) return res.status(400).json({ success: false, message: 'Bonus is locked (wagering not met)' });
  const claimAmount = bonus.balance;
  bonus.balance = 0;
  bonus.claimedAmount = claimAmount;
  bonus.status = 'CLAIMED';
  bonus.claimedAt = new Date();
  await bonus.save();
  await BonusWalletTransaction.create({
    userId,
    walletType: 'BONUS',
    type: 'CLAIMED',
    amount: claimAmount,
    balanceBefore: claimAmount,
    balanceAfter: 0,
    transactionId: `claim_${bonusId}_${Date.now()}`,
    ref: `claim_${bonusId}`,
    remark: `Bonus claimed: ${bonus.bonusType}`
  });
  // Emit socket event to user
  if (req.app.get('io')) {
    req.app.get('io').to(userId).emit('bonusClaimed', { bonusId, claimedAmount });
  }
  res.json({ success: true, claimedAmount });
});

exports.bonusHistory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const transactions = await BonusWalletTransaction.find({ userId, walletType: 'BONUS' }).sort({ createdAt: -1 });
  res.json({ success: true, transactions });
});
