// backend/models/Banner.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
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
  messageId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  priority: {
    type: Number,
    default: 0
  },
  targetPlatform: {
    type: String,
    enum: ['web', 'mobile', 'both'],
    default: 'both'
  }
}, {
  timestamps: true
});

export default mongoose.model('Banner', bannerSchema);