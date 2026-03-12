const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/widgetController');
const adminAuth = require('../middleWare/AdminAuth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'widgets'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// All widget routes require admin authentication
router.use(adminAuth);

// Widget CRUD operations
router.get('/', widgetController.getAllWidgets);
router.get('/stats', widgetController.getWidgetStats);
router.get('/:id', widgetController.getWidgetById);
router.post('/', widgetController.createWidget);
router.put('/:id', widgetController.updateWidget);
router.delete('/:id', widgetController.deleteWidget);
router.post('/bulk-order', widgetController.bulkUpdateOrder);
router.post('/reorder', widgetController.bulkUpdateOrder);
router.patch('/:id/status', widgetController.updateWidgetStatus);
router.post('/:id/clone', widgetController.cloneWidget);
router.get('/:id/analytics', widgetController.getWidgetAnalytics);
router.post('/upload', upload.single('file'), widgetController.uploadWidgetAsset);

module.exports = router;
