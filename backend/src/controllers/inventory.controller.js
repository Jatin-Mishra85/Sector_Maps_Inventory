const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

const createInventory = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payload = {
      developerName: req.body.developerName,
      sectorName: req.body.sectorName,
      inventoryType: req.body.type,
      inventoryName: req.body.name,
      description: req.body.description,
      googleMapUrl: req.body.googleMapUrl,
      googleMapPolygon: req.body.polygon,
      imageUrl,
    };

    const inventory = await inventoryService.createInventory(payload);
    return ApiResponse.success(res, HTTP_STATUS.CREATED, 'Inventory created successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const getAllInventories = async (req, res, next) => {
  try {
    const { page, limit, developerId, sectorId, inventoryType } = req.query;
    const result = await inventoryService.getAllInventories({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      developerId: developerId ? parseInt(developerId, 10) : undefined,
      sectorId: sectorId ? parseInt(sectorId, 10) : undefined,
      inventoryType,
    });
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventories fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventoryById(parseInt(req.params.id, 10));
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory fetched successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    let imageUrl = req.body.existingImageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const payload = {
      developerName: req.body.developerName,
      sectorName: req.body.sectorName,
      inventoryType: req.body.type,
      inventoryName: req.body.name,
      description: req.body.description,
      googleMapUrl: req.body.googleMapUrl,
      googleMapPolygon: req.body.polygon,
      imageUrl,
    };

    const inventory = await inventoryService.updateInventory(parseInt(req.params.id, 10), payload);
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory updated successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.deleteInventory(parseInt(req.params.id, 10));
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory deleted successfully', inventory);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};