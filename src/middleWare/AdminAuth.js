const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Admin Authentication Middleware
const AdminAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Or from cookie
    else if (req.cookies?.jwt || req.cookies?.token) {
      token = req.cookies.jwt || req.cookies.token;
    }

    // No token
    if (!token) {
      return next(new AppError('You are not logged in! Please login to access this route.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'bajicrick247-secret-key');

    // Attach decoded user to req (basic - no DB lookup to avoid model dependency)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'admin'
    };

    logger.info(`AdminAuth: Admin ${decoded.email} (ID: ${decoded.id}) authenticated`);

    next();
  } catch (error) {
    logger.error('AdminAuth error:', error);
    return next(new AppError('Invalid token. Please login again.', 401));
  }
};

// Restrict to specific roles (admin, subadmin, etc.)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = AdminAuth;
module.exports.restrictTo = restrictTo;

