// const winston = require('winston');
// const moment = require('moment');

// const logger = winston.createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.errors({ stack: true }),
//     winston.format.json()
//   ),
//   defaultMeta: { 
//     service: 'bajicrick-api',
//     timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss')
//   },
//   transports: [
//     new winston.transports.File({ 
//       filename: 'logs/error.log', 
//       level: 'error',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5
//     }),
//     new winston.transports.File({ 
//       filename: 'logs/combined.log',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5
//     })
//   ]
// });

// // Add console transport in development
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.simple()
//     )
//   }));
// }

// // Custom stream for Morgan HTTP logging
// logger.stream = {
//   write: (message) => {
//     logger.info(message.trim());
//   }
// };

// module.exports = logger;



const winston = require('winston');
const moment = require('moment');

// Check if we're in Vercel or another serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION || 
                     process.env.NODE_ENV === 'production' && !process.env.ALLOW_FILE_LOGGING;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'bajicrick-api',
    timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss')
  },
  transports: [
    // Always use console transport
    new winston.transports.Console({
      format: winston.format.combine(
        process.env.NODE_ENV === 'production' 
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
      )
    })
  ]
});

// Only add file transports if NOT in serverless environment
if (!isServerless) {
  try {
    // Try to create logs directory and add file transports
    const fs = require('fs');
    const path = require('path');
    
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    logger.add(new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
    
    logger.add(new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
    
    logger.info('File logging enabled - logs directory created');
  } catch (error) {
    logger.warn(`File logging disabled: ${error.message}`);
  }
} else {
  logger.info('Running in serverless environment - using console logging only');
}

// Custom stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;