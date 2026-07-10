const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

const createInventoryValidator = runValidation([
  body('developerName')
    .trim()
    .notEmpty()
    .withMessage('Developer name is required')
    .isLength({ max: 200 })
    .withMessage('Developer name must not exceed 200 characters'),
  body('sectorName')
    .trim()
    .notEmpty()
    .withMessage('Sector name is required')
    .isLength({ max: 200 })
    .withMessage('Sector name must not exceed 200 characters'),
  body('inventoryType').optional().trim().isString(),
  body('inventoryName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('inventoryName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
  body('imageUrl').optional().trim().isString(),
  body('googleMapPolygon').optional().isString(),
]);

const updateInventoryValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid inventory id'),
  body('developerName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Developer name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Developer name must not exceed 200 characters'),
  body('sectorName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Sector name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Sector name must not exceed 200 characters'),
  body('inventoryType').optional().trim().isString(),
  body('inventoryName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('inventoryName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
  body('imageUrl').optional().trim().isString(),
  body('googleMapPolygon').optional().isString(),
]);

const inventoryIdParamValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid inventory id'),
]);

const getAllInventoriesValidator = runValidation([
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('developerId').optional().isInt({ min: 1 }).withMessage('developerId must be a positive integer'),
  query('sectorId').optional().isInt({ min: 1 }).withMessage('sectorId must be a positive integer'),
  query('inventoryType').optional().trim().isString(),
]);

const searchInventoriesValidator = runValidation([
  query('keyword').optional().trim().isString(),
  query('inventoryType').optional().trim().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
]);

module.exports = {
  createInventoryValidator,
  updateInventoryValidator,
  inventoryIdParamValidator,
  getAllInventoriesValidator,
  searchInventoriesValidator,
};