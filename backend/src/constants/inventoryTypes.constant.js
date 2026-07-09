const INVENTORY_TYPES = Object.freeze({
  PROJECT: 'PROJECT',
  COLONY: 'COLONY',
  BLOCK: 'BLOCK',
});

const INVENTORY_TYPE_LIST = Object.freeze(Object.values(INVENTORY_TYPES));

module.exports = {
  INVENTORY_TYPES,
  INVENTORY_TYPE_LIST,
};