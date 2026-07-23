const asyncHandler = require('../utils/asyncHandler.util');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const searchService = require('../services/search.service');
const { mapInventoryRow } = require('./inventory.controller');

const searchInventories = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const inventoryType = req.query.inventoryType || undefined;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await searchService.searchInventories({ keyword, inventoryType, page, limit });
  const mappedResult = { ...result, items: result.items.map(mapInventoryRow) };
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Search results fetched successfully', mappedResult);
});

const suggestInventories = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const result = await searchService.suggestInventories({ keyword, limitPerCategory: 5 });
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Suggestions fetched successfully', result);
});

module.exports = {
  searchInventories,
  suggestInventories,
};