// models/GameProvider.js
const mongoose = require('mongoose');

const gameProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  apiConfig: {
    apiKey: String,
    baseUrl: String,
    secretKey: String,
    operatorId: String
  },
  supportedCurrencies: [String],
  supportedLanguages: [String],
  features: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameProvider', gameProviderSchema);