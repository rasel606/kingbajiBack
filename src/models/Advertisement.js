const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game', // Assume Game model exists
    required: false
  },
  targetPlatform: {
    type: String,
    enum: ['web', 'mobile', 'both'],
    default: 'both'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Advertisement', advertisementSchema);

