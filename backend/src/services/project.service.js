// backend/services/project.service.js
const projectRepository = require('../repositories/project.repository');

async function getAllProjects() {
    return projectRepository.getAll();
}

async function getProjectById(projectId) {
    return projectRepository.getById(projectId);
}

async function createProject(projectName) {
    if (!projectName || projectName.trim() === '') {
        const error = new Error('ProjectName is required.');
        error.statusCode = 400;
        throw error;
    }
    return projectRepository.create(projectName.trim());
}

async function updateProject(projectId, projectName) {
    if (!projectName || projectName.trim() === '') {
        const error = new Error('ProjectName is required.');
        error.statusCode = 400;
        throw error;
    }
    const updated = await projectRepository.update(projectId, projectName.trim());
    if (!updated) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }
    return updated;
}

async function deleteProject(projectId) {
    const deleted = await projectRepository.remove(projectId);
    if (!deleted) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject }; 