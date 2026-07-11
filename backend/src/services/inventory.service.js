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
  const finalDeveloperName = (developerName || '').trim() || 'Unknown Developer';
  const finalSectorName = (sectorName || '').trim() || 'Unknown Sector';

  const developer = await developerRepository.findOrCreateByName(finalDeveloperName);
  const sector = await sectorRepository.findOrCreateByName(finalSectorName, developer.DeveloperId);
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

/**
 * PARTIAL UPDATE LOGIC:
 * The Edit modal (temporary admin tool) only sends a few fields at a time
 * (e.g. just name + description + image). It does NOT send developerName,
 * sectorName, type, googleMapUrl, etc. every time.
 *
 * So here we fetch the existing row first, and only override a field if
 * the caller actually included that key in `payload`. Anything not sent
 * keeps its old DB value. This prevents:
 *   - InventoryType/InventoryName becoming NULL (DB crash)
 *   - Developer/Sector silently getting reset to "Unknown Developer"/
 *     "Unknown Sector" on every partial edit
 *   - ImageUrl getting wiped out when no new image is uploaded
 */
const updateInventory = async (inventoryId, payload) => {
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }

  // Only re-resolve developer/sector if the caller actually sent a name.
  // Otherwise keep the sector link exactly as it already is.
  let sectorId = existing.SectorId;
  const developerNameSent = payload.developerName !== undefined;
  const sectorNameSent = payload.sectorName !== undefined;

  if (developerNameSent || sectorNameSent) {
    const resolved = await resolveDeveloperAndSector(payload.developerName, payload.sectorName);
    sectorId = resolved.sectorId;
  }

  const mergedPayload = {
    sectorId,
    inventoryType: payload.inventoryType !== undefined ? payload.inventoryType : existing.InventoryType,
    inventoryName: payload.inventoryName !== undefined ? payload.inventoryName : existing.InventoryName,
    description: payload.description !== undefined ? payload.description : existing.Description,
    imageUrl: payload.imageUrl !== undefined ? payload.imageUrl : existing.ImageUrl,
    googleMapUrl: payload.googleMapUrl !== undefined ? payload.googleMapUrl : existing.GoogleMapUrl,
    googleMapPolygon:
      payload.googleMapPolygon !== undefined ? payload.googleMapPolygon : existing.GoogleMapPolygon,
  };

  const row = await inventoryRepository.update(inventoryId, mergedPayload);
  return InventoryModel.fromRow(row);
};

const deleteInventory = async (inventoryId) => {
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }

  // TEMPORARY — hard delete (permanently removes the row from the DB,
  // not just IsDeleted = 1). This is only for cleaning up wrongly-entered
  // data during testing/manual entry. Once the real Admin Panel is built,
  // switch this back to inventoryRepository.softDelete(inventoryId) so
  // records can be recovered/audited instead of being lost forever.
  const row = await inventoryRepository.hardDelete(inventoryId);
  return InventoryModel.fromRow(row);
};

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};