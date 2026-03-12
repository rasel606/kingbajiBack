const express = require('express');
const router = express.Router();
const AdminAuth = require('../middleWare/AdminAuth');
const AdvertisementController = require('../controllers/AdvertisementController');

// Admin-only routes
router.use(AdminAuth);

router.get('/ads', AdvertisementController.getAdvertisements);
router.get('/ads/:id', AdvertisementController.getAdvertisementById);
router.post('/ads', AdvertisementController.createAdvertisement);
router.put('/ads/:id', AdvertisementController.updateAdvertisement);
router.delete('/ads/:id', AdvertisementController.deleteAdvertisement);
router.put('/ads/:id/toggle', AdvertisementController.toggleAdvertisementActive);
router.get('/games-for-ad', AdvertisementController.getGamesForAd);

module.exports = router;

