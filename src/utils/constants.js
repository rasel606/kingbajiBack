module.exports = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    AGENT: 'agent',
    SUBADMIN: 'subadmin'
  },
  
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
  },
  
  VERIFICATION: {
    EMAIL: 'email',
    PHONE: 'phone',
    BOTH: 'both'
  },
  
  REFERRAL_LEVELS: {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3
  },
  
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    RESET_CODE_EXPIRY: 10 * 60 * 1000, // 10 minutes
    OTP_EXPIRY: 5 * 60 * 1000 // 5 minutes
  },
  
  BONUS: {
    REFERRAL_LEVEL_1: 100,
    REFERRAL_LEVEL_2: 50,
    REFERRAL_LEVEL_3: 25
  },
  
  API: {
    OPERATOR_CODE: process.env.API_OPERATOR_CODE || 'rbdb',
    SECRET_KEY: process.env.API_SECRET_KEY || '9332fd9144a3a1a8bd3ab7afac3100b0',
    BASE_URL: process.env.API_BASE_URL || 'http://fetch.336699bet.com'
  },
  
  VALIDATION: {
    USER_ID: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_]+$/
    },
    PASSWORD: {
      MIN_LENGTH: 6
    },
    PHONE: {
      PATTERN: /^\d{10,15}$/
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};