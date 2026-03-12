const express = require("express");
const router = express.Router();
const gatewayController = require("../controllers/GatewayController");

/**
 * Gateway Management Routes
 * Base path: /api/gateway
 */

// ============================================
// Gateway CRUD Routes
// ============================================

/**
 * @route   POST /api/gateway/create
 * @desc    Create a new gateway
 * @access  Private (Admin, SubAdmin, Affiliate)
 */
router.post("/create", gatewayController.createGateway);

/**
 * @route   PUT /api/gateway/update/:gatewayId
 * @desc    Update gateway
 * @access  Private (Owner)
 */
router.put("/update/:gatewayId", gatewayController.updateGateway);

/**
 * @route   DELETE /api/gateway/delete/:gatewayId
 * @desc    Delete gateway (soft delete)
 * @access  Private (Owner, Admin)
 */
router.delete("/delete/:gatewayId", gatewayController.deleteGateway);

/**
 * @route   GET /api/gateway/owner/:ownerId
 * @desc    Get all gateways for specific owner
 * @access  Private (Owner, Admin)
 */
router.get("/owner/:ownerId", gatewayController.getGatewaysByOwner);

/**
 * @route   GET /api/gateway/all
 * @desc    Get all gateways (with pagination and filters)
 * @access  Private (Admin)
 */
router.get("/", gatewayController.getAllGateways);

// ============================================
// Gateway Statistics Routes
// ============================================

/**
 * @route   GET /api/gateway/:gatewayId/statistics
 * @desc    Get gateway statistics
 * @access  Private (Owner, Admin)
 */
router.get("/:gatewayId/statistics", gatewayController.getGatewayStatistics);

/**
 * @route   PATCH /api/gateway/:gatewayId/toggle
 * @desc    Toggle gateway active status
 * @access  Private (Owner, Admin)
 */
router.patch("/:gatewayId/toggle", gatewayController.toggleGateway);

/**
 * @route   GET /api/gateway/:gatewayId
 * @desc    Get single gateway by ID
 * @access  Private
 */
router.get("/:gatewayId", gatewayController.getGatewayById);

module.exports = router;
