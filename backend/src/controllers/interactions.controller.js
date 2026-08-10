// backend/src/controllers/interactions.controller.js
const interactionsService = require('../services/interactions.service');

// NOTE: requireAuth middleware se req.user.userId already set hoga
// (login ke time JWT mein { userId, email } save kiya gaya tha).
// reportInventory par ab requireAuth nahi lagi (route file dekho),
// isliye us function mein req.user hona guaranteed nahi — safe access use karo.

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
        // Login ho to userId bhejo, na ho to null — crash nahi hoga.
        const userId = req.user?.userId || null;
        await interactionsService.reportInventory(
            userId,
            req.body.inventoryId,
            req.body.reason,
            req.body.details
        );
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