// backend/controllers/inventory.controller.js
const inventoryService = require('../services/inventory.service');
const { uploadToAzure } = require('../config/azureBlob.config');

async function mapBody(req) {
    let groupNames = [];
    if (req.body.groupNames) {
        try {
            groupNames = JSON.parse(req.body.groupNames);
        } catch (e) {
            groupNames = [];
        }
    }

    // Agar naya file aayi hai, Azure pe upload karo aur uska full URL le lo.
    // File disk pe kabhi save nahi hoti — seedha memory se Azure jaati hai.
    let imagePath;
    if (req.file) {
        imagePath = await uploadToAzure(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    return {
        developerName: req.body.actualDeveloperName,
        sectorName: req.body.sectorName,
        projectName: req.body.name,
        displaySequence: req.body.cardId,
        imagePath, // ab ye poora Azure URL hai (ya undefined agar file nahi aayi)
        groupNames,
        price: req.body.price,
        areaSqFt: req.body.areaSqFt,
        unitType: req.body.unitType,
        status: req.body.status,
        description: req.body.description,
    };
}

// Raw DB row (PascalCase, joined columns) -> frontend-expected shape (camelCase).
// Repository ka getAll/getById/create/update sab isi raw shape mein row deta hai,
// isliye ye function har response ke saath call hona chahiye.
function mapInventoryRow(row, req) {
    if (!row) return null;

    let imageUrl = null;
    if (row.ImagePath) {
        if (row.ImagePath.startsWith('http')) {
            // Naya Azure Blob URL — already poora hai, kuch add nahi karna
            imageUrl = row.ImagePath;
        } else {
            // Purani local-upload wali file — jab tak re-upload nahi hoti,
            // tab tak isi server ke against URL banate rahenge (fallback).
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${row.ImagePath}`;
        }
    }

    return {
        id: row.InventoryId,
        name: row.ProjectName || '',
        actualDeveloperName: row.DeveloperName || '',
        sectorName: row.SectorName || '',
        cardId: row.DisplaySequence,
        price: row.Price,
        areaSqFt: row.AreaSqFt,
        unitType: row.UnitType,
        status: row.Status,
        description: row.Description || '',
        imageUrl,
        groups: Array.isArray(row.Groups) ? row.Groups : [],
    };
}

async function getAll(req, res) {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const developerId = req.query.developerId ? parseInt(req.query.developerId, 10) : undefined;

        const { items, total } = await inventoryService.getAllInventory({ page, limit, developerId });

        res.status(200).json({
            success: true,
            data: {
                items: items.map((row) => mapInventoryRow(row, req)),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
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
        res.status(200).json(mapInventoryRow(item, req));
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const item = await inventoryService.createInventory(await mapBody(req));
        res.status(201).json(mapInventoryRow(item, req));
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const item = await inventoryService.updateInventory(req.params.id, await mapBody(req));
        res.status(200).json(mapInventoryRow(item, req));
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

module.exports = { getAll, getNextCardNumber, getById, create, update, remove, mapInventoryRow };