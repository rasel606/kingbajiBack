const express = require('express');
const router = express.Router();
const { handleSettlementCallback } = require('../controllers/providerSettlementController');
const { verifyProviderSettlementSignature } = require('../middleWare/providerSettlementAuth');

/**
 * @route POST /api/v1/provider/settlement-callback
 * @desc  Provider settlement callback (idempotent update by id/ref_no)
 * @access Public (provider server-to-server)
 */
router.post('/settlement-callback', verifyProviderSettlementSignature, handleSettlementCallback);

module.exports = router;
