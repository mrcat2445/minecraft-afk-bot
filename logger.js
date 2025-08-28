const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Default level for logging
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.level.toUpperCase()}] ${info.message}!`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Custom log levels for convenience
module.exports = {
  debug: (message) => logger.debug(message),
  info: (message) => logger.info(message),
  warn: (message) => logger.warn(message),
  error: (message) => logger.error(message),
  critical: (message) => logger.error(`CRITICAL: ${message}`) // Map critical to error for simplicity
};
