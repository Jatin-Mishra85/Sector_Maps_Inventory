const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

// groupNames ek JSON stringified array hoti hai FormData mein (e.g. '["BPTP","DLF"]').
// Yahan sirf ye check karte hain ki valid JSON array of strings hai — actual
// resolve/create logic controller+service layer mein hota hai.
const isValidGroupNamesJson = (value) => {
  if (value === undefined || value === '') return true;
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('groupNames must be a valid JSON array string');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('groupNames must be a JSON array');
  }
  if (!parsed.every((item) => typeof item === 'string')) {
    throw new Error('groupNames must be an array of strings');
  }
  return true;
};

const createInventoryValidator = runValidation([
  body('groupNames').optional().custom(isValidGroupNamesJson), // Grouping
  body('sectorName').optional().trim().isLength({ max: 200 }).withMessage('sectorName must not exceed 200 characters'),
  body('name').optional().trim().isLength({ max: 200 }).withMessage('name must not exceed 200 characters'), // Project
  body('block').optional().trim().isLength({ max: 200 }).withMessage('block must not exceed 200 characters'),
  body('actualDeveloperName').optional().trim().isLength({ max: 200 }).withMessage('actualDeveloperName must not exceed 200 characters'), // Developer
  body('description').optional().trim().isString(),
  body('googleMapUrl').optional().trim().isString(),
  body('polygon').optional().isString(),
]);

const updateInventoryValidator = runValidation([
  param('id').isInt({ min: 1 }).withMessage('Invalid inventory id'),
  body('groupNames').optional().custom(isValidGroupNamesJson), // Grouping
  body('sectorName').optional().trim().isLength({ max: 200 }).withMessage('sectorName must not exceed 200 characters'),
  body('name').optional().trim().isLength({ max: 200 }).withMessage('name must not exceed 200 characters'), // Project
  body('block').optional().trim().isLength({ max: 200 }).withMessage('block must not exceed 200 characters'),
  body('actualDeveloperName').optional().trim().isLength({ max: 200 }).withMessage('actualDeveloperName must not exceed 200 characters'), // Developer
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
]);

const searchInventoriesValidator = runValidation([
  query('keyword').optional().trim().isString(),
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