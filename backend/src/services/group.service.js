// backend/src/services/group.service.js
const groupRepository = require('../repositories/group.repository');

async function getAllGroups() {
    return groupRepository.getAll();
}

async function getGroupById(groupId) {
    return groupRepository.getById(groupId);
}

async function createGroup(groupName) {
    if (!groupName || groupName.trim() === '') {
        const error = new Error('GroupName is required.');
        error.statusCode = 400;
        throw error;
    }
    return groupRepository.create(groupName.trim());
}

async function updateGroup(groupId, groupName) {
    if (!groupName || groupName.trim() === '') {
        const error = new Error('GroupName is required.');
        error.statusCode = 400;
        throw error;
    }
    const updated = await groupRepository.update(groupId, groupName.trim());
    if (!updated) {
        const error = new Error('Group not found.');
        error.statusCode = 404;
        throw error;
    }
    return updated;
}

async function deleteGroup(groupId) {
    const deleted = await groupRepository.remove(groupId);
    if (!deleted) {
        const error = new Error('Group not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

// groupName se group dhoondo/banao, phir usme inventories add karo.
async function addInventoriesToGroup(groupName, inventoryIds) {
    if (!groupName || groupName.trim() === '') {
        const error = new Error('GroupName is required.');
        error.statusCode = 400;
        throw error;
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        const error = new Error('inventoryIds must be a non-empty array.');
        error.statusCode = 400;
        throw error;
    }
    const group = await groupRepository.findOrCreateByName(groupName.trim());
    return groupRepository.addInventoriesToGroup(group.GroupId, inventoryIds);
}

// groupName se existing group dhoondo (agar nahi mila to error), phir inventories remove karo.
async function removeInventoriesFromGroup(groupName, inventoryIds) {
    if (!groupName || groupName.trim() === '') {
        const error = new Error('GroupName is required.');
        error.statusCode = 400;
        throw error;
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        const error = new Error('inventoryIds must be a non-empty array.');
        error.statusCode = 400;
        throw error;
    }
    const group = await groupRepository.getByName(groupName.trim());
    if (!group) {
        const error = new Error('Group not found.');
        error.statusCode = 404;
        throw error;
    }
    return groupRepository.removeInventoriesFromGroup(group.GroupId, inventoryIds);
}

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    addInventoriesToGroup,
    removeInventoriesFromGroup,
};