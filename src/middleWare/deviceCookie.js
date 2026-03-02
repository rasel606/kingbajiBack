// src/middleWare/deviceCookie.js
// Advanced device/session cookie middleware

const DeviceSession = require('../models/DeviceSession');
const { getGeoFromIP } = require('../utils/geoip');

/**
 * Middleware: Checks for device/session cookies, sets if missing, and logs to DB
 */
module.exports = async function deviceCookie(req, res, next) {
  try {
    // Device cookie name (example: CF_VERIFIED_DEVICE_...)
    const cookieName = 'CF_VERIFIED_DEVICE_0d5fc109e57d37a02177b7ce57f6e9c43141ce9c2efaf66d7a732526119fdacf';
    let deviceId = req.cookies[cookieName];

    if (!deviceId) {
      // Generate new device/session ID
      deviceId = Math.random().toString(36).substring(2) + Date.now();
      // Set cookie (2 years expiry)
      res.cookie(cookieName, deviceId, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 2 * 365 * 24 * 60 * 60 * 1000 // 2 years
      });
    }

    // User mapping (if logged in, e.g., req.user)
    let userId = null;
    if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else if (req.body && req.body.userId) {
      userId = req.body.userId;
    }

    // Geo info (from IP)
    let geo = {};
    if (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') {
      geo = await getGeoFromIP(req.ip);
    }

    // Store/update in DB (upsert, multi-device per user supported)
    await DeviceSession.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        userId,
        lastSeen: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        geo,
        isActive: true
      },
      { upsert: true, new: true }
    );

    // Attach to request for downstream use
    req.deviceId = deviceId;
    req.deviceGeo = geo;
    next();
  } catch (err) {
    next(err);
  }
};
