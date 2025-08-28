const Joi = require('joi');

// Validate VIP points adjustment
exports.adjustPointsSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().required(),
  description: Joi.string().max(255)
});

// Validate points conversion
exports.convertPointsSchema = Joi.object({
  userId: Joi.string().required()
});

// Validate VIP level update
exports.updateLevelSchema = Joi.object({
  userId: Joi.string().required(),
  newLevel: Joi.string().valid('Bronze', 'Silver', 'Gold', 'Diamond', 'Elite').required(),
  isManual: Joi.boolean().default(true)
});

// Validate VIP status request
exports.getStatusSchema = Joi.object({
  userId: Joi.string().required()
});