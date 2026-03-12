const mongoose = require('mongoose');

/**
 * FAQ Item Schema
 */
const faqSchema = new mongoose.Schema({
  // FAQ category
  category: {
    type: String,
    enum: ['account', 'deposit', 'withdrawal', 'games', 'bonus', 'security', 'technical', 'general'],
    default: 'general'
  },

  // Question
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [255, 'Question cannot exceed 255 characters']
  },

  // Answer (HTML allowed)
  answer: {
    type: String,
    required: [true, 'Answer is required']
  },

  // Language
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'bn', 'hi', 'es', 'fr']
  },

  // Search keywords
  keywords: [{
    type: String,
    trim: true
  }],

  // Display order
  order: {
    type: Number,
    default: 0
  },

  // Number of views
  views: {
    type: Number,
    default: 0
  },

  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },

  // Not helpful votes
  notHelpfulVotes: {
    type: Number,
    default: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Featured FAQ
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Version
  version: {
    type: Number,
    default: 1
  },

  // Admin/Editor info
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Full text search index
faqSchema.index({ question: 'text', answer: 'text', keywords: 'text' });

// Category + Language index
faqSchema.index({ category: 1, language: 1, isActive: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
