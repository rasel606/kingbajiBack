const vipService = require('../Services/VipService');
const validator = require('../validators/vipValidator');
const logger = require('../utils/logger');

// Get user VIP status
exports.getVipStatus = async (req, res) => {
  try {
    console.log("getVipStatus", req.params.userId);
    const { error } = validator.getStatusSchema.validate(req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const status = await vipService.getUserVipStatus(req.params.userId);
    res.json(status);
  } catch (error) {
    logger.error(`getVipStatus controller error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Convert VIP points to money
exports.convertPoints = async (req, res) => {
  try {
    console.log("convertPoints", req.body);
    const { error } = validator.convertPointsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await vipService.convertVipPoints(req.body.userId, req.body.amount);
    res.json(result);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

// Manually adjust VIP points
exports.adjustPoints = async (req, res) => {
  try {
    console.log("adjustPoints", req.body);
    const { error } = validator.adjustPointsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await vipService.adjustVipPoints(
      req.body.userId,
      req.body.amount,
      req.body.description
    );
    res.json(result);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

// Update VIP level
exports.updateLevel = async (req, res) => {
  try {
    console.log("updateLevel", req.body);
    const { error } = validator.updateLevelSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await vipService.updateVipLevel(
      req.body.userId,
      req.body.newLevel,
      req.body.isManual
    );
    res.json(result);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

// Run daily VIP calculation (admin)
exports.runDailyCalculation = async (req, res) => {
  try {
    console.log("runDailyCalculation");
    const result = await vipService.calculateDailyVipPoints();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Run monthly VIP processing (admin)
exports.runMonthlyProcessing = async (req, res) => {
  try {
    console.log("runMonthlyProcessing");
    const result = await vipService.processMonthlyVipBonuses();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all VIP levels
exports.getVipLevels = async (req, res) => {
  try {
    console.log("getVipLevels");
    const levels = await vipService.getVipLevels();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};