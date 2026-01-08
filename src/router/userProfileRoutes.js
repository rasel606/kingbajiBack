const express = require('express');
const router = express.Router();
const {auth} = require('../middleWare/auth');
const profileController = require('../controllers/profileController');
// All profile routes require authentication
router.use(auth);

// Update full name
router.put('/full-name', auth, profileController.updateFullName);

// Get profile information
router.get('/me', auth, profileController.getProfile);

// Update other profile fields
router.put('/basic-info', auth, profileController.updateBasicInfo);

// Update phone number
// router.put('/phone-number', auth, profileController.updatePhoneNumber);

// Update email
// router.put('/email', auth, profileController.updateEmail);

// // Update country
// router.put('/country', auth, profileController.updateCountry);

// Update date of birth
// router.put('/date-of-birth', auth, profileController.updateDateOfBirth);

// Change password
router.put('/change-password', auth, profileController.changePassword);

module.exports = router;