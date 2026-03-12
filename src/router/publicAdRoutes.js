const express = require('express');
const router = express.Router();
const AdvertisementController = require('../controllers/AdvertisementController');

// Public route for frontend
router.get('/ads', AdvertisementController.getAdvertisements);

module.exports = router;

