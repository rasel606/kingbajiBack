/**
 * Route-based access control and permission system
 * Manages permissions, route protection, and resource access
 */

const logger = require('../utils/logger');

/**
 * Define permissions for each role
 */
const PERMISSIONS = {
  admin: {
    users: ['read', 'write', 'delete', 'verify', 'ban', 'approve'],
    affiliates: ['read', 'write', 'delete', 'verify', 'approve', 'manage_commission'],
    agents: ['read', 'write', 'delete', 'verify', 'approve'],
    transactions: ['read', 'write', 'approve', 'reject', 'refund'],
    reports: ['read', 'export', 'generate'],
    settings: ['read', 'write'],
    dashboard: ['read', 'write'],
    promotions: ['read', 'write', 'delete'],
    support: ['read', 'write', 'close'],
    kyc: ['read', 'write', 'verify']
  },
  
  subadmin: {
    users: ['read', 'write'],
    affiliates: ['read', 'write', 'verify'],
    agents: ['read', 'write'],
    transactions: ['read', 'approve', 'reject'],
    reports: ['read', 'export'],
    dashboard: ['read'],
    support: ['read', 'write'],
    kyc: ['read', 'verify']
  },
  
  agent: {
    users: ['read'],
    affiliates: ['read'],
    transactions: ['read'],
    reports: ['read'],
    dashboard: ['read'],
    commission: ['read'],
    support: ['read', 'write']
  },
  
  affiliate: {
    users: ['read'], // Own referrals
    transactions: ['read'], // Own transactions
    dashboard: ['read'],
    commission: ['read'],
    earnings: ['read'],
    reports: ['read'],
    support: ['read', 'write']
  },
  
  user: {
    profile: ['read', 'write'],
    transactions: ['read'], // Own transactions
    dashboard: ['read'],
    games: ['read', 'play'],
    wallet: ['read'],
    support: ['read', 'write']
  }
};

/**
 * Check if user has permission
 */
const hasPermission = (userType, resource, action) => {
  const roles = PERMISSIONS[userType];
  
  if (!roles) {
    return false;
  }
  
  if (!roles[resource]) {
    return false;
  }
  
  return roles[resource].includes(action);
};

/**
 * Middleware factory to check permissions
 */
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!hasPermission(req.userType, resource, action)) {
      logger.warn(`Permission denied: ${req.userType} tried ${action} on ${resource}`);
      
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${resource}`,
        code: 'PERMISSION_DENIED',
        required: { resource, action }
      });
    }

    // Pass available permissions to next middleware
    req.permissions = PERMISSIONS[req.userType][resource];
    next();
  };
};

/**
 * Middleware to check resource ownership
 */
const requireOwnership = (resourceField = '_id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceId = req.params[resourceField] || req.query[resourceField];
    const userId = req.user._id?.toString() || req.user.userId;

    // Allow admins and subadmins to access any resource
    if (['admin', 'subadmin'].includes(req.userType)) {
      return next();
    }

    // For other users, check ownership
    if (resourceId !== userId && resourceId !== req.user._id?.toString()) {
      logger.warn(`Ownership check failed: User ${userId} tried to access ${resourceId}`);
      
      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources',
        code: 'OWNERSHIP_REQUIRED'
      });
    }

    next();
  };
};

/**
 * Rate limiting based on role
 */
const RATE_LIMITS = {
  admin: { requests: 1000, window: '1h' },
  subadmin: { requests: 500, window: '1h' },
  agent: { requests: 300, window: '1h' },
  affiliate: { requests: 200, window: '1h' },
  user: { requests: 100, window: '1h' }
};

/**
 * Get rate limit for user
 */
const getRateLimit = (userType) => {
  return RATE_LIMITS[userType] || RATE_LIMITS.user;
};

/**
 * Route configuration with required permissions
 */
const ROUTE_CONFIG = {
  '/api/users': {
    GET: { roles: ['admin', 'subadmin'], permission: ['users', 'read'] },
    POST: { roles: ['admin'], permission: ['users', 'write'] },
    PUT: { roles: ['admin', 'subadmin'], permission: ['users', 'write'] },
    DELETE: { roles: ['admin'], permission: ['users', 'delete'] }
  },
  '/api/affiliates': {
    GET: { roles: ['admin', 'subadmin'], permission: ['affiliates', 'read'] },
    POST: { roles: ['admin'], permission: ['affiliates', 'write'] },
    PUT: { roles: ['admin', 'subadmin'], permission: ['affiliates', 'write'] },
    DELETE: { roles: ['admin'], permission: ['affiliates', 'delete'] }
  },
  '/api/transactions': {
    GET: { roles: ['admin', 'subadmin', 'agent', 'user'], permission: ['transactions', 'read'] },
    POST: { roles: ['admin'], permission: ['transactions', 'write'] },
    PUT: { roles: ['admin'], permission: ['transactions', 'write'] }
  },
  '/api/dashboard': {
    GET: { roles: ['admin', 'subadmin', 'agent', 'affiliate', 'user'], permission: ['dashboard', 'read'] }
  },
  '/api/reports': {
    GET: { roles: ['admin', 'subadmin', 'agent'], permission: ['reports', 'read'] },
    POST: { roles: ['admin', 'subadmin'], permission: ['reports', 'write'] }
  },
  '/api/kyc': {
    GET: { roles: ['admin', 'subadmin', 'user'], permission: ['kyc', 'read'] },
    POST: { roles: ['user'], permission: ['kyc', 'write'] },
    PUT: { roles: ['admin', 'subadmin'], permission: ['kyc', 'write'] },
    VERIFY: { roles: ['admin', 'subadmin'], permission: ['kyc', 'verify'] }
  }
};

/**
 * Middleware to apply route config
 */
const applyRouteConfig = (req, res, next) => {
  const method = req.method;
  const config = ROUTE_CONFIG[req.baseUrl];

  if (!config) {
    return next(); // No config for this route
  }

  const methodConfig = config[method];

  if (!methodConfig) {
    return next(); // No config for this method
  }

  if (!methodConfig.roles.includes(req.userType)) {
    logger.warn(`Route access denied: ${req.userType} tried ${method} ${req.baseUrl}`);
    
    return res.status(403).json({
      success: false,
      message: `Only ${methodConfig.roles.join(', ')} can ${method} this resource`,
      code: 'ACCESS_DENIED',
      allowedRoles: methodConfig.roles
    });
  }

  next();
};

/**
 * Get all permissions for a role
 */
const getPermissionsForRole = (userType) => {
  return PERMISSIONS[userType] || {};
};

/**
 * Check multiple permissions (AND operation)
 */
const hasAllPermissions = (userType, permissions) => {
  return permissions.every(([resource, action]) => 
    hasPermission(userType, resource, action)
  );
};

/**
 * Check any permission (OR operation)
 */
const hasAnyPermission = (userType, permissions) => {
  return permissions.some(([resource, action]) => 
    hasPermission(userType, resource, action)
  );
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  requirePermission,
  requireOwnership,
  getRateLimit,
  getPermissionsForRole,
  ROUTE_CONFIG,
  applyRouteConfig
};
