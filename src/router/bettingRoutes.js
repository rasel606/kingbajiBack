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
// router.use(auth);
router.get('/records',auth,getBettingRecords);

router.get('/records/grouped',auth,getBettingRecordsGrouped);

router.get('/records/:id',auth,getBettingRecordById);

router.get('/summary',auth,getBettingSummary);

router.get('/export',exportBettingRecords);

module.exports = router;