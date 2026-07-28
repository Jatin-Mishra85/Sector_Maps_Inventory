// backend/src/controllers/interactions.controller.js
const interactionsService = require('../services/interactions.service');

// NOTE: requireAuth middleware se req.user.userId already set hoga
// (login ke time JWT mein { userId, email } save kiya gaya tha).

async function saveInventory(req, res) {
    try {
        await interactionsService.saveInventory(req.user.userId, req.body.inventoryId);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function unsaveInventory(req, res) {
    try {
        await interactionsService.unsaveInventory(req.user.userId, req.params.inventoryId);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getSavedIds(req, res) {
    try {
        const ids = await interactionsService.getSavedInventoryIds(req.user.userId);
        res.status(200).json({ success: true, data: ids });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function reportInventory(req, res) {
    try {
        await interactionsService.reportInventory(req.user.userId, req.body.inventoryId, req.body.reason);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = {
    saveInventory,
    unsaveInventory,
    getSavedIds,
    reportInventory,
};