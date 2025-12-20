
// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const BonusWalletController = require('../controllers/BonusWalletController');
const { auth } = require('../middleWare/auth'); // Your user auth middleware
router.get('/bonus_wallet_balance', auth, BonusWalletController.getBonusWallet);
// router.get('/bonus_wallet_history', BonusWalletController.getBonusWalletTransaction);
router.put('/claim_real_time_bonus', auth, BonusWalletController.claimBonus);

module.exports = router;
