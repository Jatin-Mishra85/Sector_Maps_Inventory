// backend/services/inventory.service.js
const inventoryRepository = require('../repositories/inventory.repository');

// Sirf aur sirf Card No (DisplaySequence) required hai — baki sab (Developer/Sector/Project/etc) optional.
function validate(data) {
    if (
        data.displaySequence === undefined ||
        data.displaySequence === null ||
        data.displaySequence === '' ||
        isNaN(Number(data.displaySequence))
    ) {
        const error = new Error('Card No is required.');
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

// Form khulte hi frontend ye call karke agla free Card No dikhata hai (max + 1).
async function getNextCardNumber() {
    const max = await inventoryRepository.getMaxDisplaySequence();
    const next = max ? Number(max) + 1 : 1;
    return next;
}

async function createInventory(data) {
    validate(data);

    const alreadyExists = await inventoryRepository.displaySequenceExists(data.displaySequence);
    if (alreadyExists) {
        const error = new Error(`Card No ${data.displaySequence} already exists. Choose a different value.`);
        error.statusCode = 409;
        throw error;
    }

    try {
        return await inventoryRepository.create(data);
    } catch (err) {
        // Fallback in case of a race condition caught by a DB-level unique constraint.
        if (err.message && err.message.includes('UQ_Inventory_DisplaySequence')) {
            const error = new Error(`Card No ${data.displaySequence} already exists. Choose a different value.`);
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

async function updateInventory(inventoryId, data) {
    validate(data);

    const alreadyExists = await inventoryRepository.displaySequenceExists(data.displaySequence, inventoryId);
    if (alreadyExists) {
        const error = new Error(`Card No ${data.displaySequence} already exists. Choose a different value.`);
        error.statusCode = 409;
        throw error;
    }

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
            const error = new Error(`Card No ${data.displaySequence} already exists. Choose a different value.`);
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

module.exports = {
    getAllInventory,
    getInventoryById,
    getNextCardNumber,
    createInventory,
    updateInventory,
    deleteInventory,
};