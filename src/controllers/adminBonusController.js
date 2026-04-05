const BonusWallet = require('../models/BonusWallet');
const asyncHandler = require('express-async-handler');

const createBonus = asyncHandler(async (req, res) => {
  const { userId, bonusType, amount, wageringRequirement, expiresAt, metadata } = req.body;
  if (!userId || !bonusType || !amount) {
    return res.status(400).json({ success: false, message: 'userId, bonusType, and amount are required' });
  }
  const bonus = await BonusWallet.create({
    userId,
    bonusType,
    amount,
    balance: amount,
    wageringRequirement: wageringRequirement || 0,
    status: 'ACTIVE',
    expiresAt,
    metadata,
    activatedAt: new Date()
  });
  // Emit socket event to user
  if (req.app.get('io')) {
    req.app.get('io').to(userId).emit('bonusGranted', { bonus });
  }
  res.status(201).json({ success: true, bonus });
});

const listBonuses = asyncHandler(async (req, res) => {
  const { userId, status, bonusType } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  if (bonusType) filter.bonusType = bonusType;
  const bonuses = await BonusWallet.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, bonuses });
});

const updateBonus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const bonus = await BonusWallet.findByIdAndUpdate(id, update, { new: true });
  if (!bonus) return res.status(404).json({ success: false, message: 'Bonus not found' });
  // Emit socket event to user
  if (req.app.get('io')) {
    req.app.get('io').to(bonus.userId).emit('bonusUpdated', { bonus });
  }
  res.json({ success: true, bonus });
});

const deleteBonus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bonus = await BonusWallet.findByIdAndDelete(id);
  if (!bonus) return res.status(404).json({ success: false, message: 'Bonus not found' });
  // Emit socket event to user
  if (req.app.get('io')) {
    req.app.get('io').to(bonus.userId).emit('bonusDeleted', { bonusId: id });
  }
  res.json({ success: true, message: 'Bonus deleted' });
});

module.exports = {
  createBonus,
  listBonuses,
  updateBonus,
  deleteBonus
};
