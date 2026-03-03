// routes/links.js
const express = require('express');
const router = express.Router();
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');
const {
  getLinks,
  createLink,
  updateLink,
  generateLinkPreview,
  redirectLink
} = require('../Controllers/linkController');

// Protected routes
router.get('/data', protectAffiliate, getLinks);
router.post('/postdata', protectAffiliate, createLink);
router.put('/:id', protectAffiliate, updateLink);
router.post('/generate', protectAffiliate, generateLinkPreview);

// Public route for link redirection
router.get('/redirect/:shortCode', redirectLink);

module.exports = router;