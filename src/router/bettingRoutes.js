const express = require('express');
const router = express.Router();
const {
  getBettingRecords,
  getBettingSummary,
  getBettingRecordsGrouped,
  getBettingRecordById,
  exportBettingRecords
} = require('../controllers/betController');

const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);
router.route('/records')
  .get(getBettingRecords);

router.route('/records/grouped')
  .get(getBettingRecordsGrouped);

router.route('/records/:id')
  .get(getBettingRecordById);

router.route('/summary')
  .get(getBettingSummary);

router.route('/export')
  .get(exportBettingRecords);

module.exports = router;