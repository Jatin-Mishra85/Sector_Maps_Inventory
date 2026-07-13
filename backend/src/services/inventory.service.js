const inventoryRepository = require('../repositories/inventory.repository');
const groupRepository = require('../repositories/group.repository');
const sectorRepository = require('../repositories/sector.repository');
const InventoryModel = require('../models/inventory.model');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

// Sectors table ka DeveloperId column abhi bhi NOT NULL hai (naam purana hai,
// par ab ye actually Groups.GroupId ko refer karta hai — dekho sector.repository.js
// ka comment). Isliye naya Sector create karte waqt ek Group ZARURI hai.
const UNASSIGNED_GROUP_NAME = 'UNASSIGNED';

const normalizeSectorName = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  const withoutPrefix = trimmed.replace(/^sector[\s-]*/i, '').trim();
  const finalValue = withoutPrefix ? `SECTOR ${withoutPrefix}` : trimmed;
  return finalValue.toUpperCase();
};

const normalizeBlockName = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  const withoutPrefix = trimmed.replace(/^block[\s-]*/i, '').trim();
  const finalValue = withoutPrefix ? `BLOCK ${withoutPrefix}` : trimmed;
  return finalValue.toUpperCase();
};

const normalizeUpper = (value) => (value || '').trim().toUpperCase();

/**
 * Resolves an ARRAY of Group names into an array of GroupIds — creates
 * any Group that doesn't exist yet (findOrCreate, one at a time).
 */
const resolveGroupIds = async (groupNames) => {
  const names = Array.isArray(groupNames) ? groupNames : [];
  const cleanNames = [...new Set(names.map((n) => normalizeUpper(n)).filter(Boolean))];

  const groupIds = [];
  for (const name of cleanNames) {
    const group = await groupRepository.findOrCreateByName(name);
    groupIds.push(group.GroupId);
  }
  return groupIds;
};

/**
 * Resolves Sector by name, creates it if it doesn't exist.
 *
 * Sectors.DeveloperId (NOT NULL) needs a single GroupId — but Grouping is
 * now many-to-many on the Inventory, so there's no single "the" group for
 * a Sector anymore. We use the FIRST group from the Inventory's selected
 * groupIds as the Sector's group. If no group was selected at all, we
 * fall back to a shared "UNASSIGNED" group (auto-created if missing) so
 * the NOT NULL constraint never breaks.
 */
const resolveSector = async (sectorName, groupIds) => {
  const finalSectorName = normalizeSectorName(sectorName) || 'UNKNOWN SECTOR';

  let sectorGroupId = Array.isArray(groupIds) && groupIds.length > 0 ? groupIds[0] : null;

  if (!sectorGroupId) {
    const fallbackGroup = await groupRepository.findOrCreateByName(UNASSIGNED_GROUP_NAME);
    sectorGroupId = fallbackGroup.GroupId;
  }

  const sector = await sectorRepository.findOrCreateByName(finalSectorName, sectorGroupId);
  return sector.SectorId;
};

const createInventory = async (payload) => {
  const groupIds = await resolveGroupIds(payload.groupNames);
  const sectorId = await resolveSector(payload.sectorName, groupIds);

  const row = await inventoryRepository.create({
    sectorId,
    groupIds,
    inventoryName: normalizeUpper(payload.inventoryName),
    block: normalizeBlockName(payload.block),
    inventoryDeveloperName: normalizeUpper(payload.inventoryDeveloperName),
    description: payload.description,
    imageUrl: payload.imageUrl,
    googleMapUrl: payload.googleMapUrl,
    googleMapPolygon: payload.googleMapPolygon,
  });
  return InventoryModel.fromRow(row);
};

const getAllInventories = async ({ page = 1, limit = 20, developerId, sectorId }) => {
  // `developerId` kept as the EXTERNAL filter param name for backward
  // compatibility with the frontend chip filter — internally matched
  // against GroupId via the InventoryGroups junction table.
  const { rows, total } = await inventoryRepository.findAll({
    page,
    limit,
    groupId: developerId,
    sectorId,
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
 * groupNames: undefined -> groups untouched
 * groupNames: []        -> ALL groups removed
 * groupNames: [...]     -> groups fully REPLACED with this new set
 */
const updateInventory = async (inventoryId, payload) => {
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inventory not found');
  }

  let groupIds;
  if (payload.groupNames !== undefined) {
    groupIds = await resolveGroupIds(payload.groupNames);
  }

  let sectorId = existing.SectorId;
  if (payload.sectorName !== undefined) {
    // Sector badalte waqt bhi wahi groupIds use karte hain (ya agar is
    // update mein groups nahi bheje gaye, to existing inventory ke groups
    // se pehla group le lete hain, taaki purana behavior consistent rahe).
    const groupIdsForSector = groupIds !== undefined
      ? groupIds
      : (existing.Groups || []).map((g) => g.groupId);
    sectorId = await resolveSector(payload.sectorName, groupIdsForSector);
  }

  const mergedPayload = {
    sectorId,
    groupIds,
    inventoryName:
      payload.inventoryName !== undefined ? normalizeUpper(payload.inventoryName) : existing.InventoryName,
    block: payload.block !== undefined ? normalizeBlockName(payload.block) : existing.Block,
    inventoryDeveloperName:
      payload.inventoryDeveloperName !== undefined
        ? normalizeUpper(payload.inventoryDeveloperName)
        : existing.InventoryDeveloperName,
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