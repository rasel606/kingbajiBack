// src/models/DeviceSession.js
const mongoose = require('mongoose');


const deviceSessionSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  userId: { type: String, default: null, index: true }, // ইউজার আইডি (লগইন হলে)
  lastSeen: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  geo: {
    country: String,
    city: String,
    region: String,
    lat: Number,
    lon: Number
  },
  isActive: { type: Boolean, default: true }, // মাল্টি-ডিভাইস সাপোর্ট
  // future: deviceType, browser, etc
}, { timestamps: true });

module.exports = mongoose.model('DeviceSession', deviceSessionSchema);
