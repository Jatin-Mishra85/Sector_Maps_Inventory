// backend/controllers/inventory.controller.js
const inventoryService = require('../services/inventory.service');

function mapBody(req) {
    return {
        developerId: req.body.developerId,
        sectorId: req.body.sectorId,
        projectId: req.body.projectId,
        imageId: req.body.imageId,
        displaySequence: req.body.displaySequence,
        price: req.body.price,
        areaSqFt: req.body.areaSqFt,
        unitType: req.body.unitType,
        status: req.body.status,
        description: req.body.description,
    };
}

async function getAll(req, res) {
    try {
        const inventory = await inventoryService.getAllInventory();
        res.status(200).json(inventory);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getById(req, res) {
    try {
        const item = await inventoryService.getInventoryById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Inventory not found.' });
        res.status(200).json(item);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const item = await inventoryService.createInventory(mapBody(req));
        res.status(201).json(item);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const item = await inventoryService.updateInventory(req.params.id, mapBody(req));
        res.status(200).json(item);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        await inventoryService.deleteInventory(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getAll, getById, create, update, remove };