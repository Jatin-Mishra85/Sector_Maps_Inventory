
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

async function reportInventory(userId, inventoryId, reason, details) {
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
    const trimmedDetails = typeof details === 'string' ? details.trim() : '';
    if (!trimmedDetails) {
        const err = new Error('Details are required.');
        err.statusCode = 400;
        throw err;
    }
    if (trimmedDetails.length > 500) {
        const err = new Error('Details must be 500 characters or fewer.');
        err.statusCode = 400;
        throw err;
    }
    await interactionsRepository.reportInventory(userId, id, reason, trimmedDetails);
    const emailService = require('./email.service');

async function reportInventory(userId, inventoryId, reason, details) {
    // ...existing validation same rahegi...

    await interactionsRepository.reportInventory(userId, id, reason, trimmedDetails);

    // Email fire-and-forget — isko await nahi kiya to email delay ki wajah se
    // user ka response slow na ho. Fail hua to bhi report to save ho chuka hai.
    emailService.sendReportNotification({
        inventoryId: id,
        reason,
        details: trimmedDetails,
        reportedByUserId: userId,
    });
}
}

module.exports = {
    saveInventory,
    unsaveInventory,
    getSavedInventoryIds,
    reportInventory,
};