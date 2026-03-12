const express = require("express");
const router = express.Router();
const depositBonusController = require("../controllers/DepositBonusController");

/**
 * Deposit and Bonus Routes
 * Base path: /api/deposit-bonus
 */

// ============================================
// Deposit Routes
// ============================================

/**
 * @route   POST /api/deposit-bonus/create
 * @desc    Create deposit with bonus calculation
 * @access  Private (User)
 */
router.post("/create", depositBonusController.createDepositWithBonus);

/**
 * @route   GET /api/deposit-bonus/available-gateways
 * @desc    Get available gateways for user
 * @access  Private (User)
 */
router.get("/available-gateways", depositBonusController.getAvailableGateways);

/**
 * @route   GET /api/deposit-bonus/history
 * @desc    Get deposit history with bonus details
 * @access  Private (User)
 */
router.get("/history", depositBonusController.getDepositHistory);

// ============================================
// Referral Chain Routes
// ============================================

/**
 * @route   GET /api/deposit-bonus/referral-chain
 * @desc    Get user's referral chain
 * @access  Private (User)
 */
router.get("/referral-chain", depositBonusController.getReferralChain);

/**
 * @route   POST /api/deposit-bonus/rebuild-chain
 * @desc    Rebuild referral chain for a user (Admin only)
 * @access  Private (Admin)
 */
router.post("/rebuild-chain", depositBonusController.rebuildReferralChain);

// ============================================
// Bonus Transaction Routes
// ============================================

/**
 * @route   GET /api/deposit-bonus/bonus-statistics
 * @desc    Get user's bonus statistics
 * @access  Private (User)
 */
router.get("/bonus-statistics", depositBonusController.getBonusStatistics);

/**
 * @route   GET /api/deposit-bonus/bonus-transactions
 * @desc    Get user's bonus transactions
 * @access  Private (User)
 */
router.get("/bonus-transactions", depositBonusController.getBonusTransactions);

module.exports = router;
