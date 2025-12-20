const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true, index: true },
  adminName: String,
  adminRole: String,
  
  // Action Details
  action: { type: String, required: true },
  module: { type: String, required: true },
  entityId: String,
  entityType: String,
  
  // Changes
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // IP & Device Info
  ipAddress: String,
  userAgent: String,
  deviceType: String,
  browser: String,
  
  // Location
  country: String,
  city: String,
  region: String,
  
  // Status
  status: { 
    type: String, 
    enum: ['success', 'failed', 'warning'], 
    default: 'success' 
  },
  errorMessage: String,
  
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient querying
adminActivityLogSchema.index({ adminId: 1, timestamp: -1 });
adminActivityLogSchema.index({ module: 1, timestamp: -1 });
adminActivityLogSchema.index({ action: 1, timestamp: -1 });
adminActivityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);