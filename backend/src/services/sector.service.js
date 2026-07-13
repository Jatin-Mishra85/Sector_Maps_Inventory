const sectorRepository = require('../repositories/sector.repository');
const groupRepository = require('../repositories/group.repository'); // RENAMED from developer.repository
const SectorModel = require('../models/sector.model');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

const createSector = async (payload) => {
  const group = await groupRepository.findById(payload.developerId);
  if (!group) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid DeveloperId. Group does not exist');
  }

  const row = await sectorRepository.create(payload);
  return SectorModel.fromRow(row);
};

const getAllSectors = async ({ page = 1, limit = 20, developerId }) => {
  const { rows, total } = await sectorRepository.findAll({ page, limit, developerId });
  return {
    items: SectorModel.fromRows(rows),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSectorById = async (sectorId) => {
  const row = await sectorRepository.findById(sectorId);
  if (!row) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sector not found');
  }
  return SectorModel.fromRow(row);
};

const updateSector = async (sectorId, payload) => {
  const existing = await sectorRepository.findById(sectorId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sector not found');
  }
  const row = await sectorRepository.update(sectorId, payload);
  return SectorModel.fromRow(row);
};

const deleteSector = async (sectorId) => {
  const existing = await sectorRepository.findById(sectorId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sector not found');
  }
  const row = await sectorRepository.softDelete(sectorId);
  return SectorModel.fromRow(row);
};

module.exports = {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
};