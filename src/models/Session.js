// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameProvider'
  },
  launchUrl: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);