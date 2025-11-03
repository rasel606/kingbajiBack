const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    userType: { 
        type: String, 
        enum: ['User', 'SubAdmin', 'Agent', 'Admin', 'Affiliate', 'System'],
        required: true 
    },
    targetId: { type: String },
    targetType: { type: String },
    oldValues: { type: mongoose.Schema.Types.Mixed },
    newValues: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    errorMessage: { type: String }
});

// Index for faster queries
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);