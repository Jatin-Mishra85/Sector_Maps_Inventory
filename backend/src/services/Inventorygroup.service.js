// backend/services/inventoryGroup.service.js
const inventoryGroupRepository = require('../repositories/inventoryGroup.repository');

async function getGroupsForInventory(inventoryId) {
    return inventoryGroupRepository.getGroupsForInventory(inventoryId);
}

async function getInventoryForGroup(groupId) {
    return inventoryGroupRepository.getInventoryForGroup(groupId);
}

async function addGroupToInventory(inventoryId, groupId) {
    if (!inventoryId || !groupId) {
        const error = new Error('inventoryId and groupId are both required.');
        error.statusCode = 400;
        throw error;
    }
    try {
        return await inventoryGroupRepository.addMapping(inventoryId, groupId);
    } catch (err) {
        if (err.message && err.message.includes('UQ_InventoryGroups_Pair')) {
            const error = new Error('This Inventory is already linked to this Group.');
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

async function removeGroupFromInventory(inventoryId, groupId) {
    const removed = await inventoryGroupRepository.removeMapping(inventoryId, groupId);
    if (!removed) {
        const error = new Error('Mapping not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = { getGroupsForInventory, getInventoryForGroup, addGroupToInventory, removeGroupFromInventory };