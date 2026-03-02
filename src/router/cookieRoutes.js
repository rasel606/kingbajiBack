// src/router/cookieRoutes.js
const express = require('express');
const router = express.Router();
const CookieController = require('../controllers/CookieController');

// কুকি সেট (POST)
router.post('/set', CookieController.setCookie);
// কুকি পড়া (GET)
router.get('/get', CookieController.getCookie);
// কুকি ডিলিট (POST)
router.post('/clear', CookieController.clearCookie);

module.exports = router;
