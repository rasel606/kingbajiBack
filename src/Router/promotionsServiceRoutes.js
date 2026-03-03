const express = require('express');
const BonusController = require('../Controllers/BonusTransactionController');
const router = express.Router();

// Public routes
router.get('/bonuses', BonusController.getAllBonuses);
router.get('/bonuses/:id', BonusController.getBonusById);

// Admin routes (add authentication middleware as needed)
router.post('/bonuses', BonusController.createBonus);
router.get('/admin/bonuses', BonusController.getBonuses); // Filtered/paginated
router.put('/bonuses/:id', BonusController.updateBonus);
router.delete('/bonuses/:id', BonusController.deleteBonus);
router.post('/upload-image', BonusController.imgbbUpload);

module.exports = router;