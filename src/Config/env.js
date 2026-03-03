// src/Config/env.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Default configuration
const defaults = {
    environment,
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    logLevel: process.env.LOG_LEVEL || 'info',
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/bajicrick247?retryWrites=true&w=majority&appName=Cluster0',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    vip: {
        dailyCron: process.env.VIP_DAILY_CRON || '5 0 * * *',
        monthlyCron: process.env.VIP_MONTHLY_CRON || '10 0 1 * *'
    }
};

// Environment-specific configuration
const environmentConfigs = {
    development: {
        logLevel: 'debug'
    },
    production: {
        logLevel: 'warn'
    },
    test: {
        port: 5001,
        mongoUri: 'mongodb://localhost:27017/bajicrick_test'
    }
};

// Merge configurations
const config = {
    ...defaults,
    ...(environmentConfigs[environment] || {})
};

// Validate required configuration
if (!config.mongoUri) {
    throw new Error('MongoDB connection string is not defined');
}

if (!config.jwtSecret || config.jwtSecret === 'fallback-secret-key') {
    console.warn('⚠️  Using default JWT secret. Please set JWT_SECRET in production.');
}

// Export final configuration
module.exports = config;