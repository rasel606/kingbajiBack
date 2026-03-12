/**
 * Request Logger Middleware
 * Provides comprehensive request/response logging
 */

const logger = require('./logger');

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = generateRequestId();
  
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming Request', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('Request Completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    return res.send(data);
  };
  
  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Request Error', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    body: req.body,
    params: req.params,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

/**
 * API response time tracker
 */
const responseTimeTracker = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests (> 3 seconds)
    if (duration > 3000) {
      logger.warn('Slow Request Detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        threshold: '3000ms'
      });
    }
  });
  
  next();
};

/**
 * Request body logger (for debugging)
 */
const bodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Request Body', {
      requestId: req.requestId,
      body: req.body
    });
  }
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  responseTimeTracker,
  bodyLogger,
  generateRequestId
};

