/**
 * Enhanced Validation Utilities
 * Provides comprehensive validation functions for various data types
 */

const Joi = require('joi');

/**
 * Common validation schemas
 */
const schemas = {
  // User ID validation
  userId: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.min': 'User ID must be at least 3 characters',
      'string.max': 'User ID must not exceed 50 characters',
      'string.pattern.base': 'User ID can only contain letters, numbers, and underscores'
    }),

  // Email validation
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  // Phone validation (international format)
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  // Password validation
  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 30 characters',
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, and one number'
    }),

  // Amount validation
  amount: Joi.number()
    .positive()
    .min(1)
    .max(1000000)
    .messages({
      'number.positive': 'Amount must be a positive number',
      'number.min': 'Amount must be at least 1',
      'number.max': 'Amount exceeds maximum limit'
    }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // MongoDB ObjectId validation
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid ID format'
    }),

  // Date range validation
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // Transaction status
  transactionStatus: Joi.number()
    .integer()
    .valid(0, 1, 2)
    .messages({
      'any.only': 'Invalid transaction status'
    }),

  // Transaction type
  transactionType: Joi.number()
    .integer()
    .valid(0, 1)
    .messages({
      'any.only': 'Invalid transaction type'
    })
};

/**
 * Validate user registration data
 */
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    userId: schemas.userId.required(),
    phone: schemas.phone.required(),
    password: schemas.password.required(),
    countryCode: Joi.string().default('+88'),
    referredBy: Joi.string().allow(null, ''),
    name: Joi.string().min(2).max(100)
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate login data
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    userId: schemas.userId.required(),
    password: Joi.string().required()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate transaction data
 */
const validateTransaction = (data) => {
  const schema = Joi.object({
    userId: schemas.userId.required(),
    amount: schemas.amount.required(),
    gateway_name: Joi.string().required(),
    payment_type: Joi.string().required(),
    referredBy: Joi.string().allow(null, '')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate deposit request
 */
const validateDepositRequest = (data) => {
  const schema = Joi.object({
    userId: schemas.userId.required(),
    base_amount: schemas.amount.required(),
    referredBy: Joi.string().required(),
    payment_type: Joi.string().valid('deposit', 'withdraw', 'transfer').required(),
    gateway_name: Joi.string().required(),
    gateway_Number: Joi.string().required(),
    transactionID: Joi.string().required(),
    bonusCode: Joi.string().allow(null, '')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate withdrawal request
 */
const validateWithdrawalRequest = (data) => {
  const schema = Joi.object({
    userId: schemas.userId.required(),
    amount: schemas.amount.required(),
    gateway_name: Joi.string().required(),
    mobile: schemas.phone.required(),
    referredBy: Joi.string().allow(null, '')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate pagination params
 */
const validatePagination = (data) => {
  return schemas.pagination.validate(data);
};

/**
 * Validate ID parameter
 */
const validateIdParam = (data) => {
  return schemas.objectId.validate(data);
};

/**
 * Validate date range
 */
const validateDateRange = (data) => {
  return schemas.dateRange.validate(data);
};

/**
 * Validate user profile update
 */
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    birthday: Joi.date().iso().max('now'),
    phone: schemas.phone,
    whatsapp: schemas.phone.allow(null, ''),
    country: Joi.string().max(100),
    email: schemas.email
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate password change
 */
const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: schemas.password.required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate admin update
 */
const validateAdminUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: schemas.email,
    mobile: schemas.phone,
    status: Joi.boolean(),
    role: Joi.string().valid('Admin', 'SubAdmin', 'Agent', 'Affiliate', 'User')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate search/filter query
 */
const validateSearchQuery = (data) => {
  const schema = Joi.object({
    userId: Joi.string().allow(''),
    email: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    status: Joi.number().integer().valid(0, 1, 2),
    type: Joi.number().integer().valid(0, 1),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    minAmount: Joi.number().min(0),
    maxAmount: Joi.number().min(Joi.ref('minAmount')),
    gateway_name: Joi.string(),
    sortBy: Joi.string().valid('createdAt', 'amount', 'balance'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Sanitize string input - prevent XSS
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') return sanitizeString(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Validate and sanitize request body
 */
const validateAndSanitize = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    // Sanitize the validated data
    req.body = sanitizeObject(value);
    next();
  };
};

module.exports = {
  schemas,
  validateUserRegistration,
  validateLogin,
  validateTransaction,
  validateDepositRequest,
  validateWithdrawalRequest,
  validatePagination,
  validateIdParam,
  validateDateRange,
  validateProfileUpdate,
  validatePasswordChange,
  validateAdminUpdate,
  validateSearchQuery,
  sanitizeString,
  sanitizeObject,
  validateAndSanitize
};

