// backend/controllers/inventoryGroup.controller.js
const inventoryGroupService = require('../services/inventoryGroup.service');

async function getGroupsForInventory(req, res) {
    try {
        const groups = await inventoryGroupService.getGroupsForInventory(req.params.inventoryId);
        res.status(200).json(groups);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getInventoryForGroup(req, res) {
    try {
        const inventory = await inventoryGroupService.getInventoryForGroup(req.params.groupId);
        res.status(200).json(inventory);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function addMapping(req, res) {
    try {
        const mapping = await inventoryGroupService.addGroupToInventory(req.body.inventoryId, req.body.groupId);
        res.status(201).json(mapping);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function removeMapping(req, res) {
    try {
        await inventoryGroupService.removeGroupFromInventory(req.params.inventoryId, req.params.groupId);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getGroupsForInventory, getInventoryForGroup, addMapping, removeMapping };