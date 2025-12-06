const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  color: {
    type: String,
    default: '#e74c3c',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  fontSize: {
    type: String,
    default: '16px'
  },
  icon: {
    type: String,
    default: 'https://img.s628b.com/sb/h5/assets/images/icon-set/index-theme-icon/index-announcement-icon.svg?v=1760412521693'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  targetUsers: {
    type: String,
    enum: ['all', 'user', 'affiliate', 'subagent', 'agent', 'subadmin', 'admin'],
    default: 'all'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

// Update updatedAt on save
announcementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);