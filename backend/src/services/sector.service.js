// backend/services/sector.service.js
const sectorRepository = require('../repositories/sector.repository');

async function getAllSectors() {
    return sectorRepository.getAll();
}

async function getSectorById(sectorId) {
    return sectorRepository.getById(sectorId);
}

async function createSector(sectorName) {
    if (!sectorName || sectorName.trim() === '') {
        const error = new Error('SectorName is required.');
        error.statusCode = 400;
        throw error;
    }
    return sectorRepository.create(sectorName.trim());
}

async function updateSector(sectorId, sectorName) {
    if (!sectorName || sectorName.trim() === '') {
        const error = new Error('SectorName is required.');
        error.statusCode = 400;
        throw error;
    }
    const updated = await sectorRepository.update(sectorId, sectorName.trim());
    if (!updated) {
        const error = new Error('Sector not found.');
        error.statusCode = 404;
        throw error;
    }
    return updated;
}

async function deleteSector(sectorId) {
    const deleted = await sectorRepository.remove(sectorId);
    if (!deleted) {
        const error = new Error('Sector not found.');
        error.statusCode = 404;
        throw error;
    }
    return true;
}

module.exports = { getAllSectors, getSectorById, createSector, updateSector, deleteSector };