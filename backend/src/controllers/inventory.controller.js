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
    // IMPORTANT: only include fields that were actually sent by the form.
    // Do NOT default missing fields to null/undefined placeholders here —
    // the service layer decides what to keep vs overwrite based on
    // whether a key is present at all in this payload.
    const payload = {};

    if (req.body.developerName !== undefined) payload.developerName = req.body.developerName;
    if (req.body.sectorName !== undefined) payload.sectorName = req.body.sectorName;
    if (req.body.type !== undefined) payload.inventoryType = req.body.type;
    if (req.body.name !== undefined) payload.inventoryName = req.body.name;
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.googleMapUrl !== undefined) payload.googleMapUrl = req.body.googleMapUrl;
    if (req.body.polygon !== undefined) payload.googleMapPolygon = req.body.polygon;

    // Only touch imageUrl if a new file was actually uploaded.
    // If no new file, we simply don't send imageUrl at all — so the
    // existing image is preserved, not wiped out.
    if (req.file) {
      payload.imageUrl = `/uploads/${req.file.filename}`;
    }

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