require('dotenv').config();

const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  logDirectory: 'logs',
  errorLogFile: 'error.log',
  combinedLogFile: 'combined.log',
  datePattern: 'YYYY-MM-DD',
};

module.exports = loggerConfig;