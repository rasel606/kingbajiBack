// Create cron endpoints for Vercel Cron
const express = require('express');
const router = express.Router();

// Import your cron jobs
const BettingHistoryJob = require('../corn/BettingHistoryJob');
const SpcialBettingHistoryJob = require('../corn/SpcialBettingHistoryJob');
const referralBonusProcessor = require('../corn/referralBonusProcessor');
const promoFreeSpinWorker = require('../corn/promoFreeSpinWorker');

// Verify cron secret to prevent unauthorized calls
const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Betting History Job
router.post('/betting-history', verifyCronSecret, async (req, res) => {
  try {
    await BettingHistoryJob.execute();
    await SpcialBettingHistoryJob.execute();
    res.json({ success: true, message: 'Betting history job completed' });
  } catch (error) {
    console.error('Betting history cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

// VIP Daily Job
router.post('/vip-daily', verifyCronSecret, async (req, res) => {
  try {
    // Add your VIP daily job logic here
    res.json({ success: true, message: 'VIP daily job completed' });
  } catch (error) {
    console.error('VIP daily cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

// VIP Monthly Job
router.post('/vip-monthly', verifyCronSecret, async (req, res) => {
  try {
    // Add your VIP monthly job logic here
    res.json({ success: true, message: 'VIP monthly job completed' });
  } catch (error) {
    console.error('VIP monthly cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Referral Bonus Job
router.post('/referral-bonus', verifyCronSecret, async (req, res) => {
  try {
    await referralBonusProcessor.execute();
    res.json({ success: true, message: 'Referral bonus job completed' });
  } catch (error) {
    console.error('Referral bonus cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Promo Free Spin Job
router.post('/promo-free-spin', verifyCronSecret, async (req, res) => {
  try {
    await promoFreeSpinWorker.execute();
    res.json({ success: true, message: 'Promo free spin job completed' });
  } catch (error) {
    console.error('Promo free spin cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
