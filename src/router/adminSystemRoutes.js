const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const SubAdminControllers = require('../controllers/SubAdminControllers');
const auth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');

// Dashboard & Stats
router.get('/dashboard/overview', validate, auth, AdminController.getAdminDashboardStats);
router.get('/dashboard_stats', auth, SubAdminControllers.getDashboardData);

// Social Links
router.get('/dashboard/social_link', validate, auth, AdminController.getSocialLinks);
router.post('/dashboard/update_social_link', validate, auth, AdminController.updateAndCreateSocialLinks);

module.exports = router;