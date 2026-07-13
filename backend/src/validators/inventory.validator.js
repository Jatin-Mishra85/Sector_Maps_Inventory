const { body, param, query } = require('express-validator');
const { runValidation } = require('./baseValidator.util');

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

// CardId ab decimal bhi allow karta hai (jaise "5.6"), sirf whole number nahi.
const cardIdMustBePositiveNumber = (value) => {
  if (!/^\d+(\.\d+)?$/.test(String(value)) || Number(value) <= 0) {
    throw new Error('Card ID ek positive number hona chahiye (decimal bhi allowed hai, jaise 5.6)');
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
  // CardId ab COMPULSORY hai — na khaali, na missing
  body('cardId')
    .notEmpty().withMessage('Card ID zaroori hai, isse khaali nahi chhod sakte.')
    .bail()
    .custom(cardIdMustBePositiveNumber),
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
  // Edit mein bhi CardId compulsory
  body('cardId')
    .notEmpty().withMessage('Card ID zaroori hai, isse khaali nahi chhod sakte.')
    .bail()
    .custom(cardIdMustBePositiveNumber),
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