const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

const createDeveloperValidator = runValidation([
  body('developerName')
    .trim()
    .notEmpty()
    .withMessage('developerName is required')
    .isLength({ max: 200 })
    .withMessage('developerName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
]);

const updateDeveloperValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid developer id'),
  body('developerName')
    .trim()
    .notEmpty()
    .withMessage('developerName is required')
    .isLength({ max: 200 })
    .withMessage('developerName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
]);

const developerIdParamValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid developer id'),
]);

const getAllDevelopersValidator = runValidation([
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
]);

module.exports = {
  createDeveloperValidator,
  updateDeveloperValidator,
  developerIdParamValidator,
  getAllDevelopersValidator,
};