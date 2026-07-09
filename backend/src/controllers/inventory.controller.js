const asyncHandler = require('../utils/asyncHandler.util');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const inventoryService = require('../services/inventory.service');

const createInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.createInventory(req.body);
  return ApiResponse.success(res, HTTP_STATUS.CREATED, 'Inventory created successfully', inventory);
});

const getAllInventories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const developerId = req.query.developerId ? parseInt(req.query.developerId, 10) : undefined;
  const sectorId = req.query.sectorId ? parseInt(req.query.sectorId, 10) : undefined;
  const inventoryType = req.query.inventoryType || undefined;

  const result = await inventoryService.getAllInventories({
    page,
    limit,
    developerId,
    sectorId,
    inventoryType,
  });
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventories fetched successfully', result);
});

const getInventoryById = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventoryById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory fetched successfully', inventory);
});

const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.updateInventory(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory updated successfully', inventory);
});

const deleteInventory = asyncHandler(async (req, res) => {
  await inventoryService.deleteInventory(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory deleted successfully', {});
});

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};