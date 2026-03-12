const express = require('express');
const router = express.Router();
const adminAuth = require('../middleWare/AdminAuth');
const BannerController = require('../controllers/BannerController');

// All routes protected by admin authentication
router.use(adminAuth);

// Banner Management - Admin only (not subadmin)
router.get('/', BannerController.getBanners);
router.get('/:id', BannerController.getBannerById);
router.post('/', BannerController.createBanner);
router.put('/:id', BannerController.updateBanner);
router.delete('/:id', BannerController.deleteBanner);
router.put('/:id/toggle', BannerController.toggleBannerActive);
router.get('/promotions-for-banner', BannerController.getPromotionsForBanner);

module.exports = router;

