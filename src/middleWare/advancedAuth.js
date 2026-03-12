/**
 * Advanced Authentication Middleware with RBAC (Role-Based Access Control)
 * Supports multiple user types: User, Affiliate, Agent, SubAdmin, Admin
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Affiliate = require('../models/AffiliateModel');
const AdminModel = require('../models/AdminModel');
const SubAdminModel = require('../models/SubAdminModel');
const AgentModel = require('../models/AgentModel');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

/**
 * Main authentication middleware - identifies and loads user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userType = decoded.userType || 'user';

    let user;
    let userModel;

    // Load user based on type
    switch (userType) {
      case 'admin':
        user = await AdminModel.findOne({ email: decoded.email }).select('-password');
        userModel = 'admin';
        break;
      
      case 'subadmin':
        user = await SubAdminModel.findOne({ email: decoded.email }).select('-password');
        userModel = 'subadmin';
        break;
      
      case 'agent':
        user = await AgentModel.findOne({ agentId: decoded.agentId || decoded.id }).select('-password');
        userModel = 'agent';
        break;
      
      case 'affiliate':
        user = await Affiliate.findOne({ affiliateId: decoded.affiliateId || decoded.id }).select('-password');
        userModel = 'affiliate';
        break;
      
      case 'user':
      default:
        user = await User.findOne({ 
          $or: [
            { userId: decoded.userId || decoded.id },
            { email: decoded.email }
          ]
        }).select('-password');
        userModel = 'user';
        break;
    }

    if (!user) {
      logger.warn(`User not found for token: ${userType}:${decoded.email || decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user info to request
    req.user = user;
    req.userType = userType;
    req.userModel = userModel;
    req.token = token;

    next();
  } catch (error) {
    logger.error(`Auth error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.',
      code: 'INVALID_TOKEN',
      error: error.message
    });
  }
};

/**
 * Middleware to check specific role(s)
 * Usage: route.get('/admin', requireRole('admin'), handler)
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.userType)) {
      logger.warn(`Unauthorized access attempt: ${req.userType} tried to access ${req.userType} resource`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${allowedRoles.join(', ')} can access this resource.`,
        code: 'INSUFFICIENT_PERMISSIONS',
        allowedRoles
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Check based on user type
  let isVerified = false;
  
  if (req.userType === 'user') {
    isVerified = req.user.isVerified?.email || req.user.isVerified?.phone || req.user.apiVerified;
  } else if (req.userType === 'affiliate') {
    isVerified = req.user.isVerified || req.user.status === 'approved';
  } else if (req.userType === 'agent') {
    isVerified = req.user.isVerified || req.user.status === 'active';
  } else {
    isVerified = true; // Admin and SubAdmin don't need verification
  }

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: 'User verification required to access this resource.',
      code: 'USER_NOT_VERIFIED'
    });
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userType = decoded.userType || 'user';

    let user;

    switch (userType) {
      case 'admin':
        user = await AdminModel.findOne({ email: decoded.email }).select('-password');
        break;
      case 'subadmin':
        user = await SubAdminModel.findOne({ email: decoded.email }).select('-password');
        break;
      case 'agent':
        user = await AgentModel.findOne({ agentId: decoded.agentId || decoded.id }).select('-password');
        break;
      case 'affiliate':
        user = await Affiliate.findOne({ affiliateId: decoded.affiliateId || decoded.id }).select('-password');
        break;
      case 'user':
      default:
        user = await User.findOne({
          $or: [
            { userId: decoded.userId || decoded.id },
            { email: decoded.email }
          ]
        }).select('-password');
    }

    if (user) {
      req.user = user;
      req.userType = userType;
      req.userModel = userType;
      req.token = token;
    }

    next();
  } catch (error) {
    // Optional auth doesn't fail on errors
    next();
  }
};

/**
 * Middleware for active status check
 */
const requireActive = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  const isActive = req.user.isActive !== false && req.user.status !== 'inactive';

  if (!isActive) {
    logger.warn(`Inactive user access attempt: ${req.userType}:${req.user._id}`);
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated.',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  next();
};

/**
 * Get user info middleware - adds current user info to res locals
 */
const getCurrentUser = (req, res, next) => {
  if (req.user) {
    res.locals.currentUser = {
      id: req.user._id || req.user.id,
      userId: req.user.userId || req.user.affiliateId || req.user.agentId || req.user.email,
      email: req.user.email,
      name: req.user.name,
      type: req.userType,
      role: req.user.role,
      permissions: req.user.permissions || [],
      lastLoginTime: req.user.lastLoginTime
    };
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVerified,
  requireActive,
  optionalAuth,
  getCurrentUser,
  // Export common role sets
  ROLES: {
    ADMIN: 'admin',
    SUBADMIN: 'subadmin',
    AGENT: 'agent',
    AFFILIATE: 'affiliate',
    USER: 'user'
  },
  // Common combinations
  adminOnly: requireRole('admin'),
  subAdminOnly: requireRole('subadmin', 'admin'),
  agentOnly: requireRole('agent', 'subadmin', 'admin'),
  affiliateOnly: requireRole('affiliate', 'subadmin', 'admin'),
  userOnly: requireRole('user'),
  anyAuthenticated: authenticateToken,
  staffOnly: requireRole('admin', 'subadmin', 'agent', 'affiliate')
};
