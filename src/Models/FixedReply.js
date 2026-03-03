const mongoose = require('mongoose');

const fixedReplySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'account', 'other'],
    default: 'general'
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
fixedReplySchema.index({ category: 1, isActive: 1 });
fixedReplySchema.index({ usedCount: -1 });

module.exports = mongoose.model('FixedReply', fixedReplySchema);