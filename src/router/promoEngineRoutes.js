const express = require("express");
const router = express.Router();
const promoEngineController = require("../controllers/PromoEngineController");

// Public/User
router.get("/campaigns/active", promoEngineController.getActiveCampaigns);
router.post("/evaluate", promoEngineController.evaluate);

// Admin (add auth middleware if needed)
router.post("/admin/seed-vip8", promoEngineController.seedVip8);
router.get("/admin/claims", promoEngineController.getClaims);
router.post("/admin/run-free-spin-credit", promoEngineController.runFreeSpinCreditNow);

module.exports = router;
