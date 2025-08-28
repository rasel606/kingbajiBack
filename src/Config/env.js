



const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Default configuration
const defaults = {
    environment,
    port: 5000,
    logLevel: 'info',
    mongoUri: 'mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    vip: {
        dailyCron: '* * * * *', // Daily at 00:05
        monthlyCron: '10 0 1 * *' // Monthly on 1st at 00:10
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
        port: 5000, // Random port for tests
        mongoUri: 'mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    }
};

// Merge configurations
const config = {
    ...defaults,
    ...(environmentConfigs[environment] || {})
};

// Override with environment variables if set
config.port = process.env.PORT || 5000;
config.logLevel = process.env.LOG_LEVEL || config.logLevel;
config.mongoUri = process.env.MONGO_URI || 'mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
config.vip.dailyCron = process.env.VIP_DAILY_CRON || config.vip.dailyCron;
config.vip.monthlyCron = process.env.VIP_MONTHLY_CRON || config.vip.monthlyCron;

// Validate MongoDB URI
if (!config.mongoUri) {
    throw new Error('MongoDB connection string is not defined');
}

// Export final configuration
module.exports = config;