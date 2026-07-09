const inventoryRepository = require('../repositories/inventory.repository');
const InventoryModel = require('../models/inventory.model');

/**
 * Partial search across Developer Name, Sector Name, Inventory Name, Inventory Type.
 * Optional exact filter on InventoryType.
 */
const searchInventories = async ({ keyword, inventoryType, page = 1, limit = 20 }) => {
  const { rows, total } = await inventoryRepository.search({
    keyword,
    inventoryType,
    page,
    limit,
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

module.exports = {
  searchInventories,
};