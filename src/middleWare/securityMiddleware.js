/**
 * Security Middleware
 * Provides comprehensive security features including input sanitization,
 * rate limiting, CORS configuration, and request validation
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const logger = require('./logger');

// Rate limiter for general API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for transaction endpoints
const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    success: false,
    message: 'Too many transaction requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
});

// MongoDB sanitize - prevents NoSQL injection
const mongoSanitization = mongoSanitize({
  replaceWith: '_'
});

// XSS sanitize - prevents cross-site scripting
const xssSanitization = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query params
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error('XSS sanitization error', { error: error.message });
    next(error);
  }
};

// Recursive object sanitizer
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key'].includes(key.toLowerCase())) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// HTTP Parameter Pollution prevention
const parameterPollutionProtection = hpp({
  whitelist: ['sort', 'filter', 'status', 'type'] // Allow arrays for these params
});

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10mb');
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request too large'
    });
  }
  
  next();
};

// IP whitelist checker
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn('IP not allowed', { ip: clientIP, path: req.path });
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    next();
  };
};

// API key validator
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Skip if no API key required (development mode)
  if (!process.env.REQUIRE_API_KEY || process.env.REQUIRE_API_KEY === 'false') {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  // Validate against stored keys (implement your own logic)
  const validKeys = (process.env.API_KEYS || '').split(',');
  
  if (!validKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', { ip: req.ip, path: req.path });
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// User agent validator
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  
  // Block known malicious user agents
  const blockedAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zmeu',
    'havij'
  ];
  
  const isBlocked = blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  );
  
  if (isBlocked) {
    logger.warn('Blocked malicious user agent', { 
      userAgent, 
      ip: req.ip 
    });
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Timestamp validator - prevents replay attacks
const timestampValidator = (req, res, next) => {
  const clientTime = parseInt(req.headers['x-timestamp'] || Date.now());
  const serverTime = Date.now();
  const timeDiff = Math.abs(serverTime - clientTime);
  const maxDiff = 5 * 60 * 1000; // 5 minutes
  
  if (timeDiff > maxDiff) {
    logger.warn('Request timestamp out of range', { 
      clientTime, 
      serverTime, 
      diff: timeDiff 
    });
    // Don't block in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: 'Request timestamp invalid'
      });
    }
  }
  
  next();
};

// Sensitive data filter - removes sensitive info from responses
const sensitiveDataFilter = (data, fields = ['password', 'token', 'secret', 'apiKey', 'balance']) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sensitiveDataFilter(item, fields));
  }
  
  if (typeof data === 'object') {
    const filtered = { ...data };
    fields.forEach(field => {
      if (field in filtered) {
        filtered[field] = '***REDACTED***';
      }
    });
    return filtered;
  }
  
  return data;
};

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',');
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Timestamp', 'X-API-Key'],
  maxAge: 86400 // 24 hours
};

module.exports = {
  // Rate limiters
  generalLimiter,
  authLimiter,
  transactionLimiter,
  searchLimiter,
  
  // Security middleware
  securityHeaders,
  mongoSanitization,
  xssSanitization,
  parameterPollutionProtection,
  requestSizeLimiter,
  ipWhitelist,
  validateApiKey,
  validateUserAgent,
  timestampValidator,
  
  // Utilities
  sensitiveDataFilter,
  corsOptions,
  
  // Re-export helmet for convenience
  helmet
};

