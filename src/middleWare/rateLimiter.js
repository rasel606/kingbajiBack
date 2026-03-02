// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Apply to login and register endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many requests, please try again later.'
  }
});

module.exports = authLimiter;
