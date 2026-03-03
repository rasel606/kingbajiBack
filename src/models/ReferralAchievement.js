const mongoose = require('mongoose');

const referralAchievementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  achievementId: {
    type: String,
    required: true
  },
  achievementType: {
    type: String,
    enum: ['monthly', 'weekly', 'special'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  bonusAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'completed', 'claimed'],
    default: 'locked'
  },
  unlockedAt: Date,
  completedAt: Date,
  claimedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

referralAchievementSchema.index({ userId: 1, status: 1 });
referralAchievementSchema.index({ achievementType: 1, status: 1 });

module.exports = mongoose.model('ReferralAchievement', referralAchievementSchema);