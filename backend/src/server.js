const app = require('./app');
const appConfig = require('./config/app.config');
const { connectDB, closeDB } = require('./database/connection');
const logger = require('./utils/logger.util');
const MESSAGES = require('./constants/messages.constant');

let server = null;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(appConfig.port, () => {
      logger.info(`${MESSAGES.SERVER_STARTED} on port ${appConfig.port} [${appConfig.env}]`);
    });
  } catch (error) {
    logger.error('Server failed to start', { error: error.message });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await closeDB();
      logger.info('Server and DB connections closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message });
  process.exit(1);
});

startServer();