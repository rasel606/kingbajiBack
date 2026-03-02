// src/controllers/DeviceAnalyticsController.js
const DeviceSession = require('../models/DeviceSession');
const AuditLog = require('../models/AuditLog');

/**
 * ডিভাইস/সেশন অ্যানালিটিক্স
 */
exports.getUserDeviceStats = async (req, res) => {
  const userId = req.query.userId || req.cookies.userId;
  if (!userId) return res.status(400).json({ message: 'userId প্রয়োজন' });
  const devices = await DeviceSession.find({ userId }).select('-_id deviceId ip geo lastSeen userAgent isActive');
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.isActive).length;
  const lastSeen = devices.map(d => d.lastSeen).sort().pop();
  res.json({ userId, totalDevices, activeDevices, lastSeen, devices });
};

/**
 * suspicious device/session detection
 */
exports.checkSuspiciousSession = async (req, res) => {
  const userId = req.query.userId || req.cookies.userId;
  if (!userId) return res.status(400).json({ message: 'userId প্রয়োজন' });
  const devices = await DeviceSession.find({ userId });
  // Example: suspicious if more than 3 active devices or geo mismatch
  const activeDevices = devices.filter(d => d.isActive);
  const geoSet = new Set(activeDevices.map(d => d.geo && d.geo.country));
  let suspicious = false;
  let reason = '';
  if (activeDevices.length > 3) {
    suspicious = true;
    reason = 'একাধিক (৩+) active device';
  } else if (geoSet.size > 1) {
    suspicious = true;
    reason = 'ভিন্ন দেশ/location থেকে একাধিক session';
  }
  res.json({ userId, suspicious, reason, activeDevices });
};

/**
 * Audit log fetch
 */
exports.getUserAuditLogs = async (req, res) => {
  const userId = req.query.userId || req.cookies.userId;
  if (!userId) return res.status(400).json({ message: 'userId প্রয়োজন' });
  const logs = await AuditLog.find({ performedBy: userId }).sort({ timestamp: -1 }).limit(20);
  res.json({ userId, logs });
};
