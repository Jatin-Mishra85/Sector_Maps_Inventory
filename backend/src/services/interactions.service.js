
// backend/src/services/interactions.service.js
const interactionsRepository = require('../repositories/interactions.repository');

// Report ke liye sirf ye 4 reasons allowed hain — frontend se kuch bhi aaye,
// agar in 4 mein se nahi hai to reject karo.
const VALID_REPORT_REASONS = ['Wrong info', 'Spam', 'Duplicate', 'Other'];

async function saveInventory(userId, inventoryId) {
    const id = parseInt(inventoryId, 10);
    if (!Number.isInteger(id)) {
        const err = new Error('Invalid inventory id.');
        err.statusCode = 400;
        throw err;
    }
    await interactionsRepository.saveInventory(userId, id);
}

async function unsaveInventory(userId, inventoryId) {
    const id = parseInt(inventoryId, 10);
    if (!Number.isInteger(id)) {
        const err = new Error('Invalid inventory id.');
        err.statusCode = 400;
        throw err;
    }
    await interactionsRepository.unsaveInventory(userId, id);
}

async function getSavedInventoryIds(userId) {
    return interactionsRepository.getSavedInventoryIds(userId);
}

async function reportInventory(userId, inventoryId, reason) {
    const id = parseInt(inventoryId, 10);
    if (!Number.isInteger(id)) {
        const err = new Error('Invalid inventory id.');
        err.statusCode = 400;
        throw err;
    }
    if (!VALID_REPORT_REASONS.includes(reason)) {
        const err = new Error('Invalid report reason.');
        err.statusCode = 400;
        throw err;
    }
    await interactionsRepository.reportInventory(userId, id, reason);
}

module.exports = {
    saveInventory,
    unsaveInventory,
    getSavedInventoryIds,
    reportInventory,
};