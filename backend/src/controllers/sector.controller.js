const asyncHandler = require('../utils/asyncHandler.util');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const sectorService = require('../services/sector.service');

const createSector = asyncHandler(async (req, res) => {
  const sector = await sectorService.createSector(req.body);
  return ApiResponse.success(res, HTTP_STATUS.CREATED, 'Sector created successfully', sector);
});

const getAllSectors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const developerId = req.query.developerId ? parseInt(req.query.developerId, 10) : undefined;

  const result = await sectorService.getAllSectors({ page, limit, developerId });
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Sectors fetched successfully', result);
});

const getSectorById = asyncHandler(async (req, res) => {
  const sector = await sectorService.getSectorById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Sector fetched successfully', sector);
});

const updateSector = asyncHandler(async (req, res) => {
  const sector = await sectorService.updateSector(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Sector updated successfully', sector);
});

const deleteSector = asyncHandler(async (req, res) => {
  await sectorService.deleteSector(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Sector deleted successfully', {});
});

module.exports = {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
};