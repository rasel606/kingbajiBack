// ============================================================
// AI Bot Routes - MegaBaji Application
// ============================================================

const express = require('express');
const router = express.Router();
const {
  systemHealthCheck,
  runDiagnostics,
  analyzeError,
  chatWithBot,
  receiveErrorLog,
  testApiConnection
} = require('../controllers/aiBotController');

// Rate limiter (optional, সুরক্ষার জন্য)
const rateLimit = require('express-rate-limit');
const botLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // ১ মিনিট
  max: 30, // সর্বোচ্চ ৩০ রিকোয়েস্ট
  message: { error: 'অনেক বেশি রিকোয়েস্ট। ১ মিনিট পরে আবার চেষ্টা করুন।' }
});

// =====================================
// পাবলিক রাউট (Auth প্রয়োজন নেই)
// =====================================

// GET /api/ai-bot/health - সিস্টেম স্বাস্থ্য পরীক্ষা
router.get('/health', botLimiter, systemHealthCheck);

// POST /api/ai-bot/chat - AI বটের সাথে কথা বলুন (বাংলায়)
router.post('/chat', botLimiter, chatWithBot);

// POST /api/ai-bot/analyze-error - এরর বিশ্লেষণ
router.post('/analyze-error', botLimiter, analyzeError);

// POST /api/ai-bot/log-error - ফ্রন্টেন্ড এরর লগ পাঠান
router.post('/log-error', botLimiter, receiveErrorLog);

// POST /api/ai-bot/test-connection - API কানেকশন টেস্ট
router.post('/test-connection', botLimiter, testApiConnection);

// GET /api/ai-bot/diagnostics - পূর্ণ ডায়াগনস্টিক রিপোর্ট
router.get('/diagnostics', botLimiter, runDiagnostics);

module.exports = router;
