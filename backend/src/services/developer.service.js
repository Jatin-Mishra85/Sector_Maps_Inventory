// backend/services/developer.service.js
//
// Business rules live here. Right now the only rule is:
// "DeveloperName is required and must be free text" (no validation restrictions,
// per the standing free-text-only project rule).
const developerRepository = require('../repositories/developer.repository');

async function getAllDevelopers() {
    return developerRepository.getAll();
}

async function getDeveloperById(developerId) {
    return developerRepository.getById(developerId);
}

async function createDeveloper(developerName) {
    if (!developerName || developerName.trim() === '') {
        const error = new Error('DeveloperName is required.');
        error.statusCode = 400;
        throw error;
    }
    return developerRepository.create(developerName.trim());
}

async function updateDeveloper(developerId, developerName) {
    if (!developerName || developerName.trim() === '') {
        const error = new Error('DeveloperName is required.');
        error.statusCode = 400;
        throw error;
    }
    const updated = await developerRepository.update(developerId, developerName.trim());
    if (!updated) {
        const error = new Error('Developer not found.');
        error.statusCode = 404;
        throw error;
    }
    return updated;
}

async function deleteDeveloper(developerId) {
    const deleted = await developerRepository.remove(developerId);
    if (!deleted) {
        const error = new Error('Developer not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = {
    getAllDevelopers,
    getDeveloperById,
    createDeveloper,
    updateDeveloper,
    deleteDeveloper
};