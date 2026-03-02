const express = require('express');
const { getBanks, addBank, updateBank, deleteBank } = require('../Controllers/BankController');
const { protectAffiliate } = require('../middleWare/affiliateAuth');
const router = express.Router();



router.use(protectAffiliate);

// GET /affiliate/banks
router.get('/', getBanks);
// POST /affiliate/banks
router.post('/', addBank);
// PUT /affiliate/banks/:id
router.put('/:id', updateBank);
// DELETE /affiliate/banks/:id
router.delete('/:id', deleteBank);

module.exports = router;
