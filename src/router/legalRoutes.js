const express = require('express');
const router = express.Router();
const {
  // Legal Content Routes
  getLegalContent,
  getLegalPages,
  searchLegalContent,
  createLegalContent,
  getLegalContentVersions,
  restoreLegalContentVersion,
  toggleLegalContentStatus,
  // FAQ Routes
  getFAQItems,
  getFAQItem,
  searchFAQ,
  voteFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus,
  bulkUpdateFAQOrder
} = require('../controllers/legalController');

// Import admin auth middleware (adjust path as needed)
const adminAuth = require('../MiddleWare/AdminAuth');

/**
 * ==================================================
 * PUBLIC ROUTES - No authentication required
 * ==================================================
 */

// Legal Content Routes
router.get('/pages', getLegalPages);
router.get('/search', searchLegalContent);

// FAQ Routes
router.get('/faq', getFAQItems);
router.get('/faq/item/:id', getFAQItem);
router.post('/faq/:id/vote', voteFAQ);
router.get('/faq/search', searchFAQ);

// Dynamic legal content route (keep after static routes)
router.get('/:type', getLegalContent);

/**
 * ==================================================
 * ADMIN ROUTES - Requires admin authentication
 * ==================================================
 */

// Legal Content Admin Routes
router.post('/content', adminAuth, createLegalContent);
router.get('/:type/versions', adminAuth, getLegalContentVersions);
router.put('/:type/restore/:version', adminAuth, restoreLegalContentVersion);
router.patch('/:type/toggle', adminAuth, toggleLegalContentStatus);

// FAQ Admin Routes
router.post('/faq', adminAuth, createFAQ);
router.put('/faq/:id', adminAuth, updateFAQ);
router.delete('/faq/:id', adminAuth, deleteFAQ);
router.patch('/faq/:id/toggle', adminAuth, toggleFAQStatus);
router.put('/faq/bulk/order', adminAuth, bulkUpdateFAQOrder);

module.exports = router;
