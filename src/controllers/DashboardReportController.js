// src/controllers/DashboardReportController.js
const DeviceSession = require('../models/DeviceSession');

/**
 * Custom summary report: geo/device/session
 */
exports.summaryReport = async (req, res) => {
  const devices = await DeviceSession.find({});
  // Geo summary
  const geoSummary = {};
  devices.forEach(d => {
    const country = d.geo?.country || 'Unknown';
    geoSummary[country] = (geoSummary[country] || 0) + 1;
  });
  // Device summary
  const deviceSummary = { mobile: 0, desktop: 0 };
  devices.forEach(d => {
    const ua = d.userAgent || '';
    if (/Mobile|Android|iPhone/i.test(ua)) deviceSummary.mobile++;
    else deviceSummary.desktop++;
  });
  // Session summary
  const totalSessions = devices.length;
  const activeSessions = devices.filter(d => d.isActive).length;
  res.json({ geoSummary, deviceSummary, totalSessions, activeSessions });
};

/**
 * Realtime dashboard: live session, alerts, stats
 */
exports.realtimeDashboard = async (req, res) => {
  const activeDevices = await DeviceSession.find({ isActive: true });
  const alerts = activeDevices.filter(d => d.geo?.country !== 'BDT'); // Example: suspicious
  const stats = {
    activeSessions: activeDevices.length,
    suspiciousSessions: alerts.length,
    lastUpdated: new Date()
  };
  res.json({ activeDevices, alerts, stats });
};
