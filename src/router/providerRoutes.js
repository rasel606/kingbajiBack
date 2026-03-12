const express = require('express');
const router = express.Router();
const ProviderController = require('../controllers/providerController');
const BonusController = require('../controllers/BonusController');

/**
 * Provider Routes
 * Third-party provider এর সব routes
 */

// ==========================================
// Provider Management Routes
// ==========================================

/**
 * @route   GET /api/v1/providers
 * @desc    Get all providers
 * @access  Public
 */
router.get('/providers', ProviderController.getAllProviders);

/**
 * @route   GET /api/v1/providers/:id
 * @desc    Get provider by ID
 * @access  Public
 */
router.get('/providers/:id', ProviderController.getProviderById);

/**
 * @route   POST /api/v1/providers
 * @desc    Create new provider
 * @access  Private (Admin)
 */
router.post('/providers', ProviderController.createProvider);

/**
 * @route   PUT /api/v1/providers/:id
 * @desc    Update provider
 * @access  Private (Admin)
 */
router.put('/providers/:id', ProviderController.updateProvider);

/**
 * @route   DELETE /api/v1/providers/:id
 * @desc    Delete provider
 * @access  Private (Admin)
 */
router.delete('/providers/:id', ProviderController.deleteProvider);

/**
 * @route   POST /api/v1/providers/:code/members
 * @desc    Create member in provider
 * @access  Private
 */
router.post('/providers/:code/members', ProviderController.createMember);

/**
 * @route   GET /api/v1/providers/:providerCode/balance/:userId
 * @desc    Get user balance from provider
 * @access  Private
 */
router.get('/providers/:providerCode/balance/:userId', ProviderController.getBalance);

/**
 * @route   POST /api/v1/providers/:providerCode/games/:gameId/launch
 * @desc    Launch game
 * @access  Private
 */
router.post('/providers/:providerCode/games/:gameId/launch', ProviderController.launchGame);

/**
 * @route   GET /api/v1/providers/:providerCode/games
 * @desc    Get game list from provider
 * @access  Public
 */
router.get('/providers/:providerCode/games', ProviderController.getGameList);

// ==========================================
// Session Management Routes
// ==========================================

/**
 * @route   GET /api/v1/users/:userId/sessions
 * @desc    Get user game sessions
 * @access  Private
 */
router.get('/users/:userId/sessions', ProviderController.getUserSessions);

/**
 * @route   POST /api/v1/sessions/:sessionId/end
 * @desc    End game session
 * @access  Private
 */
router.post('/sessions/:sessionId/end', ProviderController.endSession);

// ==========================================
// Transaction Routes
// ==========================================

/**
 * @route   GET /api/v1/users/:userId/transactions
 * @desc    Get user transactions
 * @access  Private
 */
router.get('/users/:userId/transactions', ProviderController.getUserTransactions);

/**
 * @route   GET /api/v1/users/:userId/transactions/stats
 * @desc    Get user transaction statistics
 * @access  Private
 */
router.get('/users/:userId/transactions/stats', ProviderController.getTransactionStats);

// ==========================================
// Bonus Routes
// ==========================================

/**
 * @route   GET /api/v1/bonuses/available
 * @desc    Get available bonuses
 * @access  Public
 */
router.get('/bonuses/available', BonusController.getAvailableBonuses);

/**
 * @route   GET /api/v1/users/:userId/bonuses/active
 * @desc    Get user active bonuses
 * @access  Private
 */
router.get('/users/:userId/bonuses/active', BonusController.getUserActiveBonuses);

/**
 * @route   GET /api/v1/users/:userId/bonuses/history
 * @desc    Get user bonus history
 * @access  Private
 */
router.get('/users/:userId/bonuses/history', BonusController.getUserBonusHistory);

/**
 * @route   POST /api/v1/bonuses/deposit
 * @desc    Process deposit bonus
 * @access  Private
 */
router.post('/bonuses/deposit', BonusController.processDepositBonus);

/**
 * @route   POST /api/v1/bonuses/cashback
 * @desc    Process cashback bonus
 * @access  Private
 */
router.post('/bonuses/cashback', BonusController.processCashback);

/**
 * @route   POST /api/v1/bonuses/rebate
 * @desc    Process rebate bonus
 * @access  Private
 */
router.post('/bonuses/rebate', BonusController.processRebate);

/**
 * @route   POST /api/v1/bonuses/:instanceId/claim
 * @desc    Claim bonus
 * @access  Private
 */
router.post('/bonuses/:instanceId/claim', BonusController.claimBonus);

/**
 * @route   GET /api/v1/users/:userId/bonuses/stats
 * @desc    Get user bonus statistics
 * @access  Private
 */
router.get('/users/:userId/bonuses/stats', BonusController.getBonusStats);

/**
 * @route   POST /api/v1/bonuses/:instanceId/cancel
 * @desc    Cancel bonus
 * @access  Private
 */
router.post('/bonuses/:instanceId/cancel', BonusController.cancelBonus);

module.exports = router;
