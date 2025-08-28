const winston = require('winston');
const path = require('path');
const { combine, timestamp, printf, colorize, errors } = winston.format;
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const config = require('../Config/env');

// Resolve logs directory path
const logDir = path.resolve(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const customFormat = printf(({ level, message, timestamp, stack }) => {
  const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  return stack ? `${logMessage}\n${stack}` : logMessage;
});

// Base logger configuration
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Console transport (colorized)
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Environment-specific file transports
if (config.environment === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 14 // keep 14 days
  }));
  
  logger.add(new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d'
  }));
} else {
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'debug.log'),
    level: 'debug',
    maxsize: 5 * 1024 * 1024,
    maxFiles: 3
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 10 * 1024 * 1024,
    maxFiles: 7
  }));
}

// Create a stream for morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;