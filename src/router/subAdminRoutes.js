const express = require('express');
const router = express.Router();
const SubAdminController = require('../controllers/SubAdminController');
const BalanceTransferController = require('../controllers/BalanceTransferController');
const subAdminAuth = require('../middleWare/subAdminAuth');

// All routes in this file are protected and require a sub-admin role
router.use(subAdminAuth);

// --- Agent Management ---
router.get('/agents', SubAdminController.getAgents);
router.get('/agents/:agentId/users', SubAdminController.getAgentUsers);
router.get('/agents/deposits', SubAdminController.getAgentDeposits);
router.get('/agents/withdrawals', SubAdminController.getAgentWithdrawals);

// --- Sub-Agent Management ---
router.get('/sub-agents', SubAdminController.getSubAgents);
router.get('/sub-agents/:subAgentId/users', SubAdminController.getSubAgentUsers);
router.get('/sub-agents/deposits', SubAdminController.getSubAgentDeposits);
router.get('/sub-agents/withdrawals', SubAdminController.getSubAgentWithdrawals);

// --- Affiliate Management ---
router.get('/affiliates', SubAdminController.getAffiliates);
router.get('/affiliates/:affiliateId/users', SubAdminController.getAffiliateUsers);
router.get('/affiliates/deposits', SubAdminController.getAffiliateDeposits);
router.get('/affiliates/withdrawals', SubAdminController.getAffiliateWithdrawals);

// --- Balance Transfers ---
router.post('/transfer/agent', BalanceTransferController.transferBalanceToAgent);
router.post('/transfer/sub-agent', BalanceTransferController.transferBalanceToSubAgent);
// TODO(BLACKBOXAI): transferBalanceToAffiliate missing - commented
// router.post('/transfer/affiliate', BalanceTransferController.transferBalanceToAffiliate);

// --- Banner Management --- (ES module - using destructuring)
const { getBanners, getBannerById, createBanner, updateBanner, deleteBanner, toggleBannerActive, getPromotionsForBanner } = require('../controllers/BannerController').default || require('../controllers/BannerController');
router.get('/banners', getBanners);
router.get('/banners/:id', getBannerById);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);
router.put('/banners/:id/toggle', toggleBannerActive);
router.get('/promotions-for-banner', getPromotionsForBanner);

module.exports = router;
