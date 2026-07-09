const inventoryRepository = require('../repositories/inventory.repository');
const developerRepository = require('../repositories/developer.repository');
const sectorRepository = require('../repositories/sector.repository');
const InventoryModel = require('../models/inventory.model');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

const validateDeveloperAndSector = async (developerId, sectorId) => {
  const developer = await developerRepository.findById(developerId);
  if (!developer) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid DeveloperId. Developer does not exist');
  }

  const sector = await sectorRepository.findById(sectorId);
  if (!sector) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid SectorId. Sector does not exist');
  }

  if (sector.DeveloperId !== developerId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'SectorId does not belong to the given DeveloperId'
    );
  }
};

const createInventory = async (payload) => {
  await validateDeveloperAndSector(payload.developerId, payload.sectorId);
  const row = await inventoryRepository.create(payload);
  return InventoryModel.fromRow(row);
};

const getAllInventories = async ({ page = 1, limit = 20, developerId, sectorId, inventoryType }) => {
  const { rows, total } = await inventoryRepository.findAll({
    page,
    limit,
    developerId,
    sectorId,
    inventoryType,
  });

  return {
    items: InventoryModel.fromRows(rows),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getInventoryById = async (inventoryId) => {
  const row = await inventoryRepository.findById(inventoryId);
  if (!row) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }
  return InventoryModel.fromRow(row);
};

const updateInventory = async (inventoryId, payload) => {
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }

  const developerId = existing.DeveloperId;
  const sectorId = payload.sectorId;

  await validateDeveloperAndSector(developerId, sectorId);

  const row = await inventoryRepository.update(inventoryId, payload);
  return InventoryModel.fromRow(row);
};

const deleteInventory = async (inventoryId) => {
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }
  const row = await inventoryRepository.softDelete(inventoryId);
  return InventoryModel.fromRow(row);
};

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};