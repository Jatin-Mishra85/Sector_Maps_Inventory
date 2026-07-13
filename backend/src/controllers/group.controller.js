const groupRepository = require('../repositories/group.repository');
const ApiResponse = require('../utils/apiResponse.util');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

// Returns ALL groups (no pagination) — used by the frontend multi-select
// AND the filter chips. Includes inventoryCount per group (via
// InventoryGroups junction table, non-deleted inventories only).
const getAllGroups = async (req, res, next) => {
  try {
    const { rows } = await groupRepository.findAll({});
    const groups = rows.map((row) => ({
      id: row.GroupId,
      name: row.GroupName,
      inventoryCount: row.InventoryCount,
    }));
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Groups fetched successfully', groups);
  } catch (err) {
    next(err);
  }
};

// Bulk-adds inventories to a Group. Group is resolved by NAME — created
// if it doesn't exist yet (findOrCreate), so typing a brand-new group
// name and clicking "Save" on the Grouping Inventories page creates it.
const addInventoriesToGroup = async (req, res, next) => {
  try {
    const { groupName, inventoryIds } = req.body;

    if (!groupName || !groupName.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupName is required');
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'inventoryIds must be a non-empty array');
    }

    const normalizedName = groupName.trim().toUpperCase();
    const group = await groupRepository.findOrCreateByName(normalizedName);
    const addedCount = await groupRepository.addInventoriesToGroup(group.GroupId, inventoryIds);

    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventories added to group', {
      group: { id: group.GroupId, name: group.GroupName },
      addedCount,
    });
  } catch (err) {
    next(err);
  }
};

// Bulk-removes inventories from a Group. Group must ALREADY exist — if
// the typed name doesn't match any existing Group, there's nothing to
// remove (returns removedCount: 0 instead of erroring, since this is a
// harmless no-op).
const removeInventoriesFromGroup = async (req, res, next) => {
  try {
    const { groupName, inventoryIds } = req.body;

    if (!groupName || !groupName.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupName is required');
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'inventoryIds must be a non-empty array');
    }

    const normalizedName = groupName.trim().toUpperCase();
    const group = await groupRepository.findByName(normalizedName);

    if (!group) {
      return ApiResponse.success(res, HTTP_STATUS.OK, 'Group does not exist, nothing to remove', {
        removedCount: 0,
      });
    }

    const removedCount = await groupRepository.removeInventoriesFromGroup(group.GroupId, inventoryIds);
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventories removed from group', { removedCount });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllGroups, addInventoriesToGroup, removeInventoriesFromGroup };