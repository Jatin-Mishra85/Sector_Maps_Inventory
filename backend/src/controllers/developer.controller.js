// backend/controllers/developer.controller.js
//
// This file only handles the HTTP request/response.
// It calls the service layer and translates results into JSON responses.
const developerService = require('../services/developer.service');

async function getAll(req, res) {
    try {
        const developers = await developerService.getAllDevelopers();
        res.status(200).json(developers);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getById(req, res) {
    try {
        const developer = await developerService.getDeveloperById(req.params.id);
        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' });
        }
        res.status(200).json(developer);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const developer = await developerService.createDeveloper(req.body.developerName);
        res.status(201).json(developer);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const developer = await developerService.updateDeveloper(req.params.id, req.body.developerName);
        res.status(200).json(developer);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        await developerService.deleteDeveloper(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getAll, getById, create, update, remove };