// backend/services/inventory.service.js
const inventoryRepository = require('../repositories/inventory.repository');

function validate(data) {
    if (data.displaySequence === undefined || data.displaySequence === null || data.displaySequence === '') {
        const error = new Error('DisplaySequence is required.');
        error.statusCode = 400;
        throw error;
    }
}

async function getAllInventory() {
    return inventoryRepository.getAll();
}

async function getInventoryById(inventoryId) {
    return inventoryRepository.getById(inventoryId);
}

async function createInventory(data) {
    validate(data);
    try {
        return await inventoryRepository.create(data);
    } catch (err) {
        // Unique constraint on DisplaySequence — give a clear message instead of raw SQL error.
        if (err.message && err.message.includes('UQ_Inventory_DisplaySequence')) {
            const error = new Error('That DisplaySequence value is already in use. Choose a different value.');
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

async function updateInventory(inventoryId, data) {
    validate(data);
    try {
        const updated = await inventoryRepository.update(inventoryId, data);
        if (!updated) {
            const error = new Error('Inventory not found.');
            error.statusCode = 404;
            throw error;
        }
        return updated;
    } catch (err) {
        if (err.message && err.message.includes('UQ_Inventory_DisplaySequence')) {
            const error = new Error('That DisplaySequence value is already in use. Choose a different value.');
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

async function deleteInventory(inventoryId) {
    const deleted = await inventoryRepository.remove(inventoryId);
    if (!deleted) {
        const error = new Error('Inventory not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = { getAllInventory, getInventoryById, createInventory, updateInventory, deleteInventory };