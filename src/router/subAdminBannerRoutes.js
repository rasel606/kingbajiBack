const express = require('express');
const router = express.Router();
const subAdminAuth = require('../MiddleWare/subAdminAuth');
const BannerController = require('../controllers/BannerController');

// SubAdmin-authenticated banner management routes
router.use(subAdminAuth);

router.get('/promotions-for-banner', BannerController.getPromotionsForBanner);
router.get('/banners', BannerController.getBanners);
router.get('/banners/:id', BannerController.getBannerById);
router.post('/banners', BannerController.createBanner);
router.put('/banners/:id', BannerController.updateBanner);
router.delete('/banners/:id', BannerController.deleteBanner);
router.put('/banners/:id/toggle', BannerController.toggleBannerActive);

module.exports = router;