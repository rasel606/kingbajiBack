// router/profileAuthRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getProfileStats,
  deleteAccount,
  updateProfilePicture,
  getSecurityInfo
} = require('../controllers/ProfileAuthController');
const { protect } = require('../MiddleWare/auth');
const { protectAffiliate } = require('../MiddleWare/affiliateAuth');
const validate = require('../middleWare/validation');

const router = express.Router();

// Middleware to require authentication (both user and affiliate can access)
const protectBoth = (req, res, next) => {
  if (req.user) {
    next();
  } else if (req.admin) {
    // If it's an admin, reject
    return res.status(403).json({ status: 'error', message: 'Not authorized' });
  } else {
    res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
};

// Use both auth middlewares
router.use((req, res, next) => {
  // Try user auth first
  return protect(req, res, (err) => {
    if (err || !req.user) {
      // If user auth fails, try affiliate auth
      return protectAffiliate(req, res, next);
    }
    next();
  });
});

// =============================================
// GET ROUTES
// =============================================

// Get user profile
router.get('/profile', getProfile);

// Get profile statistics
router.get('/stats', getProfileStats);

// Get security information
router.get('/security', getSecurityInfo);

// =============================================
// UPDATE ROUTES
// =============================================

// Update profile information
router.put(
  '/profile/update',
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('country').optional().isString().withMessage('Country must be a string'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
    body('avatar').optional().isURL().withMessage('Valid avatar URL is required')
  ],
  validate,
  updateProfile
);

// Update profile picture
router.put(
  '/profile/picture',
  [
    body('avatar').notEmpty().withMessage('Avatar URL is required').isURL().withMessage('Valid URL is required')
  ],
  validate,
  updateProfilePicture
);

// Change password
router.put(
  '/password/change',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
  ],
  validate,
  changePassword
);

// =============================================
// DELETE ROUTES
// =============================================

// Delete account
router.delete(
  '/profile/delete',
  [
    body('password').notEmpty().withMessage('Password is required for account deletion')
  ],
  validate,
  deleteAccount
);

// =============================================
// LOGOUT ROUTE
// =============================================

// Logout
router.post('/logout', logout);

module.exports = router;
