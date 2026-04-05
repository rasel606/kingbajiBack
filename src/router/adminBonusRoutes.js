const express = require('express');
const router = express.Router();
const adminBonusController = require('../controllers/adminBonusController');
const { auth } = require('../middleWare/auth');

// Admin Bonus CRUD
router.post('/bonuses', auth, adminBonusController.createBonus);
router.get('/bonuses', auth, adminBonusController.listBonuses);
router.put('/bonuses/:id', auth, adminBonusController.updateBonus);
router.delete('/bonuses/:id', auth, adminBonusController.deleteBonus);

module.exports = router;
