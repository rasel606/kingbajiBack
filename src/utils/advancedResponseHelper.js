/**
 * Advanced Response Helper
 * Provides enhanced response utilities with caching, versioning, and comprehensive metadata
 */

const logger = require('./logger');

/**
 * Create standardized response object
 */
const createResponse = (success, data, message, meta = {}) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...(success 
      ? { message: message || 'Success' }
      : { message: message || 'Error' }
    )
  };

  // Add data if provided
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  // Add metadata
  if (meta.pagination) {
    response.pagination = meta.pagination;
  }

  if (meta.total) {
    response.total = meta.total;
  }

  if (meta.count) {
    response.count = meta.count;
  }

  return response;
};

/**
 * Send success response with optional metadata
 */
const successResponse = (res, data = null, message = 'Success', meta = {}) => {
  const response = createResponse(true, data, message, meta);
  
  // Add caching headers if specified
  if (meta.cache && meta.cache.ttl) {
    res.set('Cache-Control', `public, max-age=${meta.cache.ttl}`);
    res.set('X-Cache-TTL', meta.cache.ttl.toString());
  }

  // Add rate limit info
  res.set('X-Response-Time', meta.responseTime || '0ms');

  return res.status(meta.statusCode || 200).json(response);
};

/**
 * Send error response
 */
const errorResponse = (res, message = 'Error', statusCode = 400, errors = null, meta = {}) => {
  const response = {
    success: false,
    timestamp: new Date().toISOString(),
    message,
    ...(errors && { errors }),
    ...(meta.errorCode && { errorCode: meta.errorCode })
  };

  // Add request ID for debugging
  if (meta.requestId) {
    response.requestId = meta.requestId;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    response.message = 'Internal server error';
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return successResponse(res, data, message, {
    pagination: {
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || 1,
      totalRecords: pagination.totalRecords || data.length,
      recordsPerPage: pagination.recordsPerPage || data.length,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false,
      nextPage: pagination.nextPage || null,
      prevPage: pagination.prevPage || null
    }
  });
};

/**
 * Send created response (201)
 */
const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, { statusCode: 201 });
};

/**
 * Send no content response (204)
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Send not found response (404)
 */
const notFoundResponse = (res, resource = 'Resource', message = null) => {
  return errorResponse(
    res, 
    message || `${resource} not found`, 
    404
  );
};

/**
 * Send unauthorized response (401)
 */
const unauthorizedResponse = (res, message = 'Unauthorized', errorCode = 'UNAUTHORIZED') => {
  return errorResponse(res, message, 401, null, { errorCode });
};

/**
 * Send forbidden response (403)
 */
const forbiddenResponse = res => {
  return errorResponse(
    res, 
    'You do not have permission to access this resource', 
    403,
    null,
    { errorCode: 'FORBIDDEN' }
  );
};

/**
 * Send validation error response (400)
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return errorResponse(res, message, 400, errors, { errorCode: 'VALIDATION_ERROR' });
};

/**
 * Send conflict response (409)
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409, null, { errorCode: 'CONFLICT' });
};

/**
 * Send too many requests response (429)
 */
const tooManyRequestsResponse = (res, message = 'Too many requests', retryAfter = null) => {
  if (retryAfter) {
    res.set('Retry-After', retryAfter.toString());
  }
  return errorResponse(res, message, 429, null, { errorCode: 'RATE_LIMITED' });
};

/**
 * Send service unavailable response (503)
 */
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503, null, { errorCode: 'SERVICE_UNAVAILABLE' });
};

/**
 * Wrap async route handler with consistent error handling
 */
const asyncRouteHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      // Log error
      logger.error('Route handler error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return validationErrorResponse(res, error.errors || [{ message: error.message }]);
      }

      if (error.name === 'CastError') {
        return errorResponse(res, 'Invalid ID format', 400);
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return conflictResponse(res, `${field} already exists`);
      }

      // Default to internal server error
      return errorResponse(res, error.message, 500);
    }
  };
};

/**
 * Send stream response (for file downloads)
 */
const streamResponse = (res, stream, filename, contentType = 'application/octet-stream') => {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  stream.pipe(res);
};

/**
 * Send JSON response with ETag for caching
 */
const jsonWithETag = (res, data, etag) => {
  res.set('ETag', etag);
  
  // Check if client has cached version
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).send();
  }
  
  return successResponse(res, data);
};

/**
 * Response builder for chaining
 */
class ResponseBuilder {
  constructor(res) {
    this.res = res;
    this._data = null;
    this._message = 'Success';
    this._statusCode = 200;
    this._meta = {};
  }

  data(data) {
    this._data = data;
    return this;
  }

  message(message) {
    this._message = message;
    return this;
  }

  status(code) {
    this._statusCode = code;
    return this;
  }

  meta(key, value) {
    this._meta[key] = value;
    return this;
  }

  pagination(pagination) {
    this._meta.pagination = pagination;
    return this;
  }

  send() {
    if (this._statusCode >= 400) {
      return errorResponse(this.res, this._message, this._statusCode, null, this._meta);
    }
    return successResponse(this.res, this._data, this._message, this._meta);
  }
}

/**
 * Create response builder
 */
const response = (res) => {
  return new ResponseBuilder(res);
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  conflictResponse,
  tooManyRequestsResponse,
  serviceUnavailableResponse,
  asyncRouteHandler,
  streamResponse,
  jsonWithETag,
  response
};

