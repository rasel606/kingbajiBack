// src/controllers/AdvancedAnalyticsController.js
const DeviceSession = require('../models/DeviceSession');

/**
 * Geo heatmap (country/city breakdown)
 */
exports.geoHeatmap = async (req, res) => {
  const devices = await DeviceSession.find({ isActive: true });
  const heatmap = {};
  devices.forEach(d => {
    const country = d.geo?.country || 'Unknown';
    const city = d.geo?.city || 'Unknown';
    heatmap[country] = heatmap[country] || {};
    heatmap[country][city] = (heatmap[country][city] || 0) + 1;
  });
  res.json({ heatmap });
};

/**
 * Device breakdown (mobile/desktop/browser)
 */
exports.deviceBreakdown = async (req, res) => {
  const devices = await DeviceSession.find({ isActive: true });
  const breakdown = { mobile: 0, desktop: 0, browser: {} };
  devices.forEach(d => {
    const ua = d.userAgent || '';
    if (/Mobile|Android|iPhone/i.test(ua)) breakdown.mobile++;
    else breakdown.desktop++;
    const browser = /Chrome|Firefox|Safari|Edge|Opera/i.exec(ua)?.[0] || 'Other';
    breakdown.browser[browser] = (breakdown.browser[browser] || 0) + 1;
  });
  res.json({ breakdown });
};

/**
 * Session timeline (login/logout events)
 */
exports.sessionTimeline = async (req, res) => {
  const userId = req.query.userId || req.cookies.userId;
  if (!userId) return res.status(400).json({ message: 'userId প্রয়োজন' });
  const sessions = await DeviceSession.find({ userId }).sort({ lastSeen: 1 });
  res.json({ userId, timeline: sessions.map(s => ({ deviceId: s.deviceId, lastSeen: s.lastSeen, geo: s.geo })) });
};
