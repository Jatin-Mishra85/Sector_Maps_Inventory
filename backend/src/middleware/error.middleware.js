const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');
const appConfig = require('../config/app.config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.isOperational
    ? err.message
    : MESSAGES.INTERNAL_ERROR;

  // TEMP DEBUG — hamesha full error print karo, chahe production ho ya nahi
  console.error('====== FULL ERROR (temp debug) ======');
  console.error(err);
  console.error('======================================');

  logger.error(message, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const errorPayload = {
    details: err.details || null,
    stack: err.stack, // TEMP DEBUG
    actualMessage: err.message, // TEMP DEBUG
  };

  return ApiResponse.error(res, statusCode, message, errorPayload);
};

module.exports = errorHandler;