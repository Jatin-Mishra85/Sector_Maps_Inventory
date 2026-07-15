// backend/controllers/group.controller.js
const groupService = require('../services/group.service');

async function getAll(req, res) {
    try {
        const groups = await groupService.getAllGroups();
        res.status(200).json(groups);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getById(req, res) {
    try {
        const group = await groupService.getGroupById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found.' });
        res.status(200).json(group);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const group = await groupService.createGroup(req.body.groupName);
        res.status(201).json(group);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const group = await groupService.updateGroup(req.params.id, req.body.groupName);
        res.status(200).json(group);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        await groupService.deleteGroup(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function addInventoriesToGroup(req, res) {
    try {
        const { groupId, inventoryIds } = req.body;
        const result = await groupService.addInventoriesToGroup(groupId, inventoryIds);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function removeInventoriesFromGroup(req, res) {
    try {
        const { groupId, inventoryIds } = req.body;
        const removedCount = await groupService.removeInventoriesFromGroup(groupId, inventoryIds);
        res.status(200).json({ removedCount });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getAll, getById, create, update, remove, addInventoriesToGroup, removeInventoriesFromGroup };