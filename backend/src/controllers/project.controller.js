// backend/controllers/project.controller.js
const projectService = require('../services/project.service');

async function getAll(req, res) {
    try {
        const projects = await projectService.getAllProjects();
        res.status(200).json(projects);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getById(req, res) {
    try {
        const project = await projectService.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.status(200).json(project);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function create(req, res) {
    try {
        const project = await projectService.createProject(req.body.projectName);
        res.status(201).json(project);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function update(req, res) {
    try {
        const project = await projectService.updateProject(req.params.id, req.body.projectName);
        res.status(200).json(project);
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function remove(req, res) {
    try {
        await projectService.deleteProject(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { getAll, getById, create, update, remove };