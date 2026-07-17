// backend/controllers/inventory.controller.js
const inventoryService = require('../services/inventory.service');

function mapBody(req) {
    let groupNames = [];
    if (req.body.groupNames) {
        try {
            groupNames = JSON.parse(req.body.groupNames);
        } catch (e) {
            groupNames = [];
        }
    }

    return {
        developerName: req.body.actualDeveloperName,
        sectorName: req.body.sectorName,
        projectName: req.body.name,
        displaySequence: req.body.cardId,
        imagePath: req.file ? req.file.filename : undefined, // ✅ multer se file
        groupNames,                                           // ✅ groups bhi
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
        console.error('❌ getAll Inventory error:', err);
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

// GET /api/inventory/next-card-number — form isse agla free Card No fetch karta hai.
async function getNextCardNumber(req, res) {
    try {
        const nextCardNumber = await inventoryService.getNextCardNumber();
        res.status(200).json({ nextCardNumber });
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

module.exports = { getAll, getNextCardNumber, getById, create, update, remove };