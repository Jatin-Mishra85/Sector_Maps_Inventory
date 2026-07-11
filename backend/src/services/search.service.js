const inventoryRepository = require('../repositories/inventory.repository');
const InventoryModel = require('../models/inventory.model');

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

const suggestInventories = async ({ keyword, limitPerCategory = 5 }) => {
  if (!keyword || !keyword.trim()) {
    return [];
  }
  return inventoryRepository.suggest({ keyword: keyword.trim(), limitPerCategory });
};

module.exports = {
  searchInventories,
  suggestInventories,
};