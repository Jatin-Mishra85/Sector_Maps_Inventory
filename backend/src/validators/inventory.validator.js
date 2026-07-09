const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');
const { INVENTORY_TYPE_LIST } = require('../constants/inventoryTypes.constant');

const createInventoryValidator = runValidation([
  body('developerId').isInt({ min: 1 }).withMessage('developerId is required and must be a positive integer'),
  body('sectorId').isInt({ min: 1 }).withMessage('sectorId is required and must be a positive integer'),
  body('inventoryType')
    .trim()
    .notEmpty()
    .withMessage('inventoryType is required')
    .isIn(INVENTORY_TYPE_LIST)
    .withMessage(`inventoryType must be one of: ${INVENTORY_TYPE_LIST.join(', ')}`),
  body('inventoryName')
    .trim()
    .notEmpty()
    .withMessage('inventoryName is required')
    .isLength({ max: 200 })
    .withMessage('inventoryName must not exceed 200 characters'),
  body('description').optional().trim().isString(),
  body('imageUrl').optional().trim().isString(),
  body('googleMapPolygon').optional().isString(),
]);

const updateInventoryValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid inventory id'),
  body('sectorId').isInt({ min: 1 }).withMessage('sectorId is required and must be a positive integer'),
  body('inventoryType')
    .trim()
    .notEmpty()
    .withMessage('inventoryType is required')
    .isIn(INVENTORY_TYPE_LIST)
    .withMessage(`inventoryType must be one of: ${INVENTORY_TYPE_LIST.join(', ')}`),
  body('inventoryName')
    .trim()
    .notEmpty()
    .withMessage('inventoryName is required')
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
  query('inventoryType')
    .optional()
    .isIn(INVENTORY_TYPE_LIST)
    .withMessage(`inventoryType must be one of: ${INVENTORY_TYPE_LIST.join(', ')}`),
]);

const searchInventoriesValidator = runValidation([
  query('keyword').optional().trim().isString(),
  query('inventoryType')
    .optional()
    .isIn(INVENTORY_TYPE_LIST)
    .withMessage(`inventoryType must be one of: ${INVENTORY_TYPE_LIST.join(', ')}`),
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