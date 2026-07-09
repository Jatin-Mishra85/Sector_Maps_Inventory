const asyncHandler = require('../utils/asyncHandler.util');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const developerService = require('../services/developer.service');

const createDeveloper = asyncHandler(async (req, res) => {
  const developer = await developerService.createDeveloper(req.body);
  return ApiResponse.success(res, HTTP_STATUS.CREATED, 'Developer created successfully', developer);
});

const getAllDevelopers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await developerService.getAllDevelopers({ page, limit });
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Developers fetched successfully', result);
});

const getDeveloperById = asyncHandler(async (req, res) => {
  const developer = await developerService.getDeveloperById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Developer fetched successfully', developer);
});

const updateDeveloper = asyncHandler(async (req, res) => {
  const developer = await developerService.updateDeveloper(parseInt(req.params.id, 10), req.body);
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Developer updated successfully', developer);
});

const deleteDeveloper = asyncHandler(async (req, res) => {
  await developerService.deleteDeveloper(parseInt(req.params.id, 10));
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Developer deleted successfully', {});
});

module.exports = {
  createDeveloper,
  getAllDevelopers,
  getDeveloperById,
  updateDeveloper,
  deleteDeveloper,
};