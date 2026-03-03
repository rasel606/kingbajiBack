// models/LinkModal.js
const mongoose = require('mongoose');

const LinkModalSchema = new mongoose.Schema({
 affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domainId: {
    type: String,
    required: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true
  },
  landingPage: {
    type: String,
    required: true,
    default: '2' // Sign Up page
  },
  color: {
    type: String,
    default: '#000000'
  },
  generatedLink: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

LinkModalSchema.index({ affiliate: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model('LinkModal', LinkModalSchema);