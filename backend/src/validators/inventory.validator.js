const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

const createInventoryValidator = runValidation([
  body('developerName').optional().trim().isLength({ max: 200 }).withMessage('developerName must not exceed 200 characters'),
  body('sectorName').optional().trim().isLength({ max: 200 }).withMessage('sectorName must not exceed 200 characters'),
  body('type').optional().trim().isString(),
  body('name').optional().trim().isLength({ max: 200 }).withMessage('name must not exceed 200 characters'),
  body('description').optional().trim().isString(),
  body('googleMapUrl').optional().trim().isString(),
  body('polygon').optional().isString(),
]);

const updateInventoryValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid inventory id'),
  body('developerName').optional().trim().isLength({ max: 200 }).withMessage('developerName must not exceed 200 characters'),
  body('sectorName').optional().trim().isLength({ max: 200 }).withMessage('sectorName must not exceed 200 characters'),
  body('type').optional().trim().isString(),
  body('name').optional().trim().isLength({ max: 200 }).withMessage('name must not exceed 200 characters'),
  body('description').optional().trim().isString(),
  body('googleMapUrl').optional().trim().isString(),
  body('polygon').optional().isString(),
  body('existingImageUrl').optional().trim().isString(),
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