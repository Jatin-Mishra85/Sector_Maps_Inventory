// backend/services/group.service.js
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

async function addInventoriesToGroup(groupId, inventoryIds) {
    if (!groupId) {
        const error = new Error('GroupId is required.');
        error.statusCode = 400;
        throw error;
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        const error = new Error('inventoryIds must be a non-empty array.');
        error.statusCode = 400;
        throw error;
    }
    return groupRepository.addInventoriesToGroup(groupId, inventoryIds);
}

async function removeInventoriesFromGroup(groupId, inventoryIds) {
    if (!groupId) {
        const error = new Error('GroupId is required.');
        error.statusCode = 400;
        throw error;
    }
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        const error = new Error('inventoryIds must be a non-empty array.');
        error.statusCode = 400;
        throw error;
    }
    return groupRepository.removeInventoriesFromGroup(groupId, inventoryIds);
}

module.exports = { getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, addInventoriesToGroup, removeInventoriesFromGroup };