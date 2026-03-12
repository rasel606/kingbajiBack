/**
 * Controller Wrapper
 * Provides consistent patterns for all controllers with built-in error handling,
 * validation, logging, and response formatting
 */

const logger = require('./logger');
const { sendSuccess, sendError, sendPaginatedResponse, sendNotFound, sendUnauthorized, sendValidationError } = require('./responseHelper');

/**
 * Wrapper for controller functions with comprehensive error handling
 */
const controllerWrapper = (controllerFn, options = {}) => {
  const { 
    requireAuth = false, 
    validate = null,
    logRequest = true,
    sanitizeInput = true
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log request if enabled
      if (logRequest) {
        logger.debug('Controller execution started', {
          requestId,
          controller: controllerFn.name || 'anonymous',
          method: req.method,
          path: req.originalUrl,
          userId: req.user?.userId
        });
      }

      // Input validation if schema provided
      if (validate) {
        const { error, value } = validate(req.body, { abortEarly: false });
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }));

          logger.warn('Validation failed', {
            requestId,
            errors
          });

          return sendValidationError(res, errors);
        }
        req.body = value;
      }

      // Execute controller function
      const result = await controllerFn(req, res, next);

      // Log execution time
      const executionTime = Date.now() - startTime;
      if (executionTime > 2000) {
        logger.warn('Slow controller detected', {
          requestId,
          controller: controllerFn.name,
          executionTime: `${executionTime}ms`
        });
      }

      // If controller already sent response, don't send again
      if (res.headersSent) {
        return;
      }

      // Handle different return types
      if (result === undefined) {
        // No return value - assume controller handled response
        return;
      }

      if (result && result.isBoom) {
        // Handle Boom errors
        return res.status(result.output.statusCode).json({
          success: false,
          message: result.message,
          errors: result.data
        });
      }

      // Send success response
      if (typeof result === 'object') {
        const { data, message, pagination, ...rest } = result;
        
        return sendSuccess(res, data || rest, message || 'Success', 200);
      }

      return sendSuccess(res, result);

    } catch (error) {
      // Log error
      logger.error('Controller error', {
        requestId,
        controller: controllerFn.name || 'anonymous',
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          name: error.name
        },
        body: sanitizeInput ? undefined : req.body,
        params: req.params,
        executionTime: `${Date.now() - startTime}ms`
      });

      // Handle known error types
      if (error.name === 'ValidationError') {
        return sendValidationError(res, error.errors || [{ message: error.message }]);
      }

      if (error.name === 'CastError') {
        return sendError(res, 'Invalid ID format', 400);
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return sendError(res, `${field} already exists`, 409);
      }

      if (error.name === 'JsonWebTokenError') {
        return sendUnauthorized(res, 'Invalid token');
      }

      if (error.name === 'TokenExpiredError') {
        return sendUnauthorized(res, 'Token expired');
      }

      // Default error response
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 
        ? (process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message)
        : error.message;

      return sendError(res, message, statusCode);
    }
  };
};

/**
 * Wrapper for async controller functions
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Higher-order function to wrap multiple middleware
 */
const wrapMiddleware = (...middlewares) => {
  return middlewares.map(mw => controllerWrapper(mw, { logRequest: false }));
};

/**
 * Create standardized CRUD handlers
 */
const createCRUDHandlers = (model, options = {}) => {
  const {
    populateFields = [],
    selectFields = '-password -__v',
    createValidation = null,
    updateValidation = null
  } = options;

  return {
    /**
     * Get all records with pagination and filters
     */
    getAll: controllerWrapper(async (req, res) => {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        ...filters 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          if (key.includes('.')) {
            // Handle nested fields
            query[key] = filters[key];
          } else if (typeof filters[key] === 'string' && filters[key].includes(',')) {
            // Handle arrays
            query[key] = { $in: filters[key].split(',') };
          } else {
            query[key] = filters[key];
          }
        }
      });

      // Execute queries in parallel
      const [documents, total] = await Promise.all([
        model.find(query)
          .select(selectFields)
          .populate(populateFields)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        model.countDocuments(query)
      ]);

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: skip + documents.length < total,
        hasPrev: page > 1
      };

      return {
        data: documents,
        pagination,
        message: `${documents.length} records fetched successfully`
      };
    }),

    /**
     * Get single record by ID
     */
    getOne: controllerWrapper(async (req, res) => {
      const { id } = req.params;

      const document = await model.findById(id)
        .select(selectFields)
        .populate(populateFields);

      if (!document) {
        return sendNotFound(res, 'Record');
      }

      return {
        data: document,
        message: 'Record fetched successfully'
      };
    }),

    /**
     * Create new record
     */
    create: controllerWrapper(async (req, res) => {
      const document = await model.create(req.body);

      logger.info('Record created', {
        model: model.modelName,
        documentId: document._id,
        createdBy: req.user?.userId
      });

      return {
        data: document,
        message: 'Record created successfully',
        statusCode: 201
      };
    }, { validate: createValidation }),

    /**
     * Update existing record
     */
    update: controllerWrapper(async (req, res) => {
      const { id } = req.params;

      const document = await model.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      ).select(selectFields);

      if (!document) {
        return sendNotFound(res, 'Record');
      }

      logger.info('Record updated', {
        model: model.modelName,
        documentId: document._id,
        updatedBy: req.user?.userId,
        updates: Object.keys(req.body)
      });

      return {
        data: document,
        message: 'Record updated successfully'
      };
    }, { validate: updateValidation }),

    /**
     * Delete record
     */
    delete: controllerWrapper(async (req, res) => {
      const { id } = req.params;

      const document = await model.findByIdAndDelete(id);

      if (!document) {
        return sendNotFound(res, 'Record');
      }

      logger.info('Record deleted', {
        model: model.modelName,
        documentId: id,
        deletedBy: req.user?.userId
      });

      return {
        data: { deletedId: id },
        message: 'Record deleted successfully'
      };
    })
  };
};

/**
 * Create standardized transaction handlers
 */
const createTransactionHandlers = (transactionModel, userModel) => {
  return {
    /**
     * Process deposit transaction
     */
    processDeposit: controllerWrapper(async (req, res) => {
      const { userId, amount, gateway_name, transactionID } = req.body;

      // Validate user exists
      const user = await userModel.findOne({ userId });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Check for duplicate transaction
      const existing = await transactionModel.findOne({ transactionID });
      if (existing) {
        return sendError(res, 'Transaction already exists', 409);
      }

      // Create transaction
      const transaction = await transactionModel.create({
        ...req.body,
        status: 0, // pending
        type: 0 // deposit
      });

      return {
        data: transaction,
        message: 'Deposit request submitted successfully',
        statusCode: 201
      };
    }),

    /**
     * Process withdrawal transaction
     */
    processWithdrawal: controllerWrapper(async (req, res) => {
      const { userId, amount } = req.body;

      // Validate user exists
      const user = await userModel.findOne({ userId });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Check balance
      if (user.balance < amount) {
        return sendError(res, 'Insufficient balance', 400);
      }

      // Deduct balance
      user.balance -= amount;
      await user.save();

      // Create transaction
      const transaction = await transactionModel.create({
        ...req.body,
        status: 0, // pending
        type: 1 // withdrawal
      });

      return {
        data: transaction,
        message: 'Withdrawal request submitted successfully',
        statusCode: 201
      };
    }),

    /**
     * Approve transaction
     */
    approveTransaction: controllerWrapper(async (req, res) => {
      const { transactionID, status } = req.body;

      const transaction = await transactionModel.findOne({ transactionID });
      if (!transaction) {
        return sendNotFound(res, 'Transaction');
      }

      if (transaction.status !== 0) {
        return sendError(res, 'Transaction already processed', 400);
      }

      // Update status
      transaction.status = parseInt(status);
      transaction.updatetime = new Date();
      await transaction.save();

      logger.info('Transaction processed', {
        transactionID,
        status,
        processedBy: req.user?.userId
      });

      return {
        data: transaction,
        message: status === 1 ? 'Transaction approved' : 'Transaction rejected'
      };
    })
  };
};

module.exports = {
  controllerWrapper,
  asyncHandler,
  wrapMiddleware,
  createCRUDHandlers,
  createTransactionHandlers,
  // Re-export helpers
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendNotFound,
  sendUnauthorized,
  sendValidationError
};

