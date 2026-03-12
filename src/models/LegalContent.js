const mongoose = require('mongoose');

/**
 * LegalContent Schema for Terms, Privacy, Rules, etc.
 */
const legalContentSchema = new mongoose.Schema({
  // Content type: terms, privacy, rules, responsible-gambling, about, contact
  type: {
    type: String,
    enum: ['terms', 'privacy', 'rules', 'responsible-gambling', 'about', 'contact'],
    required: [true, 'Content type is required'],
    unique: true
  },
  
  // Page title
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },

  // Page content (HTML allowed)
  content: {
    type: String,
    required: [true, 'Content is required']
  },

  // Language
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'bn', 'hi', 'es', 'fr']
  },

  // Meta description for SEO
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  // Meta keywords for SEO
  metaKeywords: {
    type: String,
    maxlength: [255, 'Meta keywords cannot exceed 255 characters']
  },

  // Version tracking
  version: {
    type: Number,
    default: 1
  },

  // Previous versions stored for history/rollback
  versions: [{
    content: String,
    version: Number,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],

  // Admin/Editor info
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
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

// Compound index for type + language uniqueness
legalContentSchema.index({ type: 1, language: 1 }, { unique: true });

// Create compound index for search
legalContentSchema.index({ content: 'text', title: 'text' });

module.exports = mongoose.model('LegalContent', legalContentSchema);
