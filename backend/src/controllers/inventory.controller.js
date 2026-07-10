const inventoryService = require('../services/inventory.service');
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
      googleMapPolygon: req.body.polygon,
      imageUrl,
    };

    const inventory = await inventoryService.createInventory(payload);
    res.status(HTTP_STATUS.CREATED).json(inventory);
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
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventoryById(parseInt(req.params.id, 10));
    res.status(HTTP_STATUS.OK).json(inventory);
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
      googleMapPolygon: req.body.polygon,
      imageUrl,
    };

    const inventory = await inventoryService.updateInventory(parseInt(req.params.id, 10), payload);
    res.status(HTTP_STATUS.OK).json(inventory);
  } catch (err) {
    next(err);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.deleteInventory(parseInt(req.params.id, 10));
    res.status(HTTP_STATUS.OK).json(inventory);
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