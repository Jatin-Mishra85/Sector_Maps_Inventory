const developerRepository = require('../repositories/developer.repository');
const DeveloperModel = require('../models/developer.model');
const ApiError = require('../utils/apiError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');

const createDeveloper = async (payload) => {
  const row = await developerRepository.create(payload);
  return DeveloperModel.fromRow(row);
};

const getAllDevelopers = async ({ page = 1, limit = 20 }) => {
  const { rows, total } = await developerRepository.findAll({ page, limit });
  return {
    items: DeveloperModel.fromRows(rows),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getDeveloperById = async (developerId) => {
  const row = await developerRepository.findById(developerId);
  if (!row) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Developer not found');
  }
  return DeveloperModel.fromRow(row);
};

const updateDeveloper = async (developerId, payload) => {
  const existing = await developerRepository.findById(developerId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Developer not found');
  }
  const row = await developerRepository.update(developerId, payload);
  return DeveloperModel.fromRow(row);
};

const deleteDeveloper = async (developerId) => {
  const existing = await developerRepository.findById(developerId);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Developer not found');
  }
  const row = await developerRepository.softDelete(developerId);
  return DeveloperModel.fromRow(row);
};

module.exports = {
  createDeveloper,
  getAllDevelopers,
  getDeveloperById,
  updateDeveloper,
  deleteDeveloper,
};