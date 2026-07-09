const fs = require('fs');
const path = require('path');
const loggerConfig = require('../config/logger.config');

const logDir = path.join(process.cwd(), loggerConfig.logDirectory);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const writeToFile = (fileName, content) => {
  const filePath = path.join(logDir, fileName);
  fs.appendFile(filePath, content + '\n', (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Logger file write failed:', err.message);
    }
  });
};

const formatMessage = (level, message, meta) => {
  const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}${metaString}`;
};

const logger = {
  info: (message, meta) => {
    const formatted = formatMessage('info', message, meta);
    // eslint-disable-next-line no-console
    console.log(formatted);
    writeToFile(loggerConfig.combinedLogFile, formatted);
  },

  warn: (message, meta) => {
    const formatted = formatMessage('warn', message, meta);
    // eslint-disable-next-line no-console
    console.warn(formatted);
    writeToFile(loggerConfig.combinedLogFile, formatted);
  },

  error: (message, meta) => {
    const formatted = formatMessage('error', message, meta);
    // eslint-disable-next-line no-console
    console.error(formatted);
    writeToFile(loggerConfig.combinedLogFile, formatted);
    writeToFile(loggerConfig.errorLogFile, formatted);
  },

  debug: (message, meta) => {
    if (loggerConfig.level === 'debug') {
      const formatted = formatMessage('debug', message, meta);
      // eslint-disable-next-line no-console
      console.debug(formatted);
      writeToFile(loggerConfig.combinedLogFile, formatted);
    }
  },
};

module.exports = logger;