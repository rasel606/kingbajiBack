// models/DomainModal.js
const mongoose = require('mongoose');

const DomainModalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  supportedLandingPages: [{
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DomainModal', DomainModalSchema);