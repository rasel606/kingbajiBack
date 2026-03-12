const express = require("express");
const router = express.Router();
const referralController = require("../controllers/ReferralManagementController");
const { auth } = require("../middleWare/auth");

// Advanced referral endpoints (new namespace, legacy /api/referral untouched)
router.get("/my-referrals", auth, referralController.getMyReferrals);
router.get("/tree", auth, referralController.getReferralTree);
router.get("/performance", auth, referralController.getReferralPerformance);
router.get("/leaderboard", referralController.getReferralLeaderboard);
router.post("/register-with-code", referralController.registerWithReferralCode);
router.post("/rebuild-all", auth, referralController.rebuildAllReferralChains);

module.exports = router;
