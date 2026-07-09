const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const MESSAGES = require('../constants/messages.constant');

/**
 * Base validation runner.
 * Executes an array of express-validator chains and throws
 * a centralized ApiError if validation fails.
 * Resource-specific validators will consume this in later phases.
 */
const runValidation = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new ApiError(
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        MESSAGES.VALIDATION_FAILED,
        true,
        formattedErrors
      )
    );
  };
};

module.exports = { runValidation };