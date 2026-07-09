const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

const createSectorValidator = runValidation([
  body('developerId').isInt({ min: 1 }).withMessage('developerId is required and must be a positive integer'),
  body('sectorName')
    .trim()
    .notEmpty()
    .withMessage('sectorName is required')
    .isLength({ max: 200 })
    .withMessage('sectorName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
]);

const updateSectorValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid sector id'),
  body('sectorName')
    .trim()
    .notEmpty()
    .withMessage('sectorName is required')
    .isLength({ max: 200 })
    .withMessage('sectorName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
]);

const sectorIdParamValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid sector id'),
]);

const getAllSectorsValidator = runValidation([
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('developerId').optional().isInt({ min: 1 }).withMessage('developerId must be a positive integer'),
]);

module.exports = {
  createSectorValidator,
  updateSectorValidator,
  sectorIdParamValidator,
  getAllSectorsValidator,
};