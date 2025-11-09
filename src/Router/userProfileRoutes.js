const express = require('express');
const router = express.Router();
const {auth} = require('../MiddleWare/auth');
const profileController = require('../Controllers/profileController');
// All profile routes require authentication
router.use(auth);

// Update full name
router.put('/full-name', auth, profileController.updateFullName);

// Get profile information
router.get('/me', auth, profileController.getProfile);

// Update other profile fields
router.put('/basic-info', auth, profileController.updateBasicInfo);

// Change password
router.put('/change-password', auth, profileController.changePassword);

module.exports = router;