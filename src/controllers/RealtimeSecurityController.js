// src/controllers/RealtimeSecurityController.js
const DeviceSession = require('../models/DeviceSession');
const { logAudit } = require('../utils/auditLogger');

/**
 * Realtime security alert (admin fetches suspicious sessions)
 */
exports.realtimeAlerts = async (req, res) => {
  const suspicious = await DeviceSession.find({ isActive: true }).where('geo.country').ne('BDT'); // Example: non-Bangladesh
  res.json({ suspicious });
};

/**
 * Admin force logout
 */
exports.forceLogout = async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ message: 'deviceId প্রয়োজন' });
  await DeviceSession.findOneAndUpdate({ deviceId }, { isActive: false, userId: null });
  await logAudit({ action: 'force-logout', performedBy: req.user?.userId || 'admin', userType: 'Admin', targetId: deviceId, targetType: 'DeviceSession', status: 'success' });
  res.json({ message: 'Force logout successful', deviceId });
};

/**
 * Admin device ban/block
 */
exports.deviceBan = async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ message: 'deviceId প্রয়োজন' });
  await DeviceSession.findOneAndUpdate({ deviceId }, { isActive: false, userId: null });
  // Add ban logic (future: ban list)
  await logAudit({ action: 'device-ban', performedBy: req.user?.userId || 'admin', userType: 'Admin', targetId: deviceId, targetType: 'DeviceSession', status: 'success' });
  res.json({ message: 'Device banned', deviceId });
};
