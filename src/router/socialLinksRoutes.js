// router/socialLinksRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getAllSocialLinks,
  getSocialLink,
  getMyLink,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  updateSocialLinkPlatform
} = require('../controllers/SocialLinksController');
const { protect } = require('../middleWare/auth');
const AdminAuth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');

const router = express.Router();

// Admin routes
router.get('/', AdminAuth, getAllSocialLinks);
router.get('/:id', AdminAuth, getSocialLink);
router.delete('/:id', AdminAuth, deleteSocialLink);

// Protected user routes
router.use(protect);

// Get user's own social links
router.get('/my/links', getMyLink);

// Create social link
router.post(
  '/',
  [
    body('platform').optional().notEmpty().withMessage('Platform is required'),
    body('url').optional().isURL().withMessage('Valid URL is required')
  ],
  validate,
  createSocialLink
);

// Update social link
router.put(
  '/:id',
  [
    body('platform').optional().notEmpty().withMessage('Platform is required'),
    body('url').optional().isURL().withMessage('Valid URL is required')
  ],
  validate,
  updateSocialLink
);

// Update specific platform link
router.put(
  '/platform/update',
  [
    body('platform').notEmpty().withMessage('Platform is required'),
    body('url').isURL().withMessage('Valid URL is required')
  ],
  validate,
  updateSocialLinkPlatform
);

module.exports = router;
