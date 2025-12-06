// routes/links.js
const express = require('express');
const router = express.Router();
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');
const {
  getKYCData,
  submitKYC,
  getAllKYC,
  updateKYCStatus
} = require('../Controllers/kycController');

// Admin routes
router.get('/all', getAllKYC);
router.put('/status/:id', updateKYCStatus);
// Protected routes
router.use(protectAffiliate);
router.get('/data', getKYCData);
router.post('/submit', submitKYC);
// router.put('/:id', auth, updateLink);
// router.post('/generate', auth, generateLinkPreview);


module.exports = router;