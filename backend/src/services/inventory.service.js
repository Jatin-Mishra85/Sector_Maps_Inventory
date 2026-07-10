const inventoryRepository = require('../repositories/inventory.repository');
const developerRepository = require('../repositories/developer.repository');
const sectorRepository = require('../repositories/sector.repository');
const InventoryModel = require('../models/inventory.model');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

/**
 * Finds developer + sector by name, creates them if they don't exist yet.
 * Used for create/update flows where user types the name freely.
 */
const resolveDeveloperAndSector = async (developerName, sectorName) => {
  const developer = await developerRepository.findOrCreateByName(developerName);
  const sector = await sectorRepository.findOrCreateByName(sectorName, developer.DeveloperId);
  return { developerId: developer.DeveloperId, sectorId: sector.SectorId };
};

const createInventory = async (payload) => {
  const { developerId, sectorId } = await resolveDeveloperAndSector(
    payload.developerName,
    payload.sectorName
  );

  const row = await inventoryRepository.create({
    ...payload,
    developerId,
    sectorId,
  });
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

  const { developerId, sectorId } = await resolveDeveloperAndSector(
    payload.developerName,
    payload.sectorName
  );

  const row = await inventoryRepository.update(inventoryId, {
    ...payload,
    sectorId,
  });
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