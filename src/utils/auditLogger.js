// src/utils/auditLogger.js
const AuditLog = require('../models/AuditLog');

/**
 * Audit log utility
 * action: login, logout, suspicious, etc
 */
async function logAudit({ action, performedBy, userType, targetId, targetType, oldValues, newValues, ipAddress, userAgent, status, errorMessage }) {
  await AuditLog.create({
    action,
    performedBy,
    userType,
    targetId,
    targetType,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    status,
    errorMessage
  });
}

module.exports = { logAudit };
