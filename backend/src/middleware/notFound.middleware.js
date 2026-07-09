const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const MESSAGES = require('../constants/messages.constant');

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `${MESSAGES.ROUTE_NOT_FOUND}: ${req.originalUrl}`
  );
  next(error);
};

module.exports = notFoundHandler;