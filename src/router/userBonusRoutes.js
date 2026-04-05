const express = require('express');
const router = express.Router();
const userBonusController = require('../controllers/userBonusController');
const { auth } = require('../middleWare/auth');

// User Bonus APIs
router.get('/bonuses', auth, userBonusController.listUserBonuses);
router.post('/bonuses/claim', auth, userBonusController.claimBonus);
router.get('/bonuses/history', auth, userBonusController.bonusHistory);

module.exports = router;
