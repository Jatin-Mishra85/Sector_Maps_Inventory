const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constant');
const ApiError = require('../utils/apiError.util');

// groupNames FormData mein JSON stringified array ke roop mein aata hai,
// jaise '["BPTP","DLF"]'. Yahan safely parse karte hain — agar galat/missing
// ho to undefined return karte hain (matlab "touch mat karo groups ko").
const parseGroupNames = (raw) => {
  if (raw === undefined) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupNames must be a JSON array');
    }
    return parsed;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'groupNames must be a valid JSON array string');
  }
};

const createInventory = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payload = {
      groupNames: parseGroupNames(req.body.groupNames), // "Grouping" in the UI — array of names
      sectorName: req.body.sectorName,
      inventoryName: req.body.name, // "Project" in the UI
      block: req.body.block,
      inventoryDeveloperName: req.body.actualDeveloperName, // "Developer" in the UI
      description: req.body.description,
      googleMapUrl: req.body.googleMapUrl,
      googleMapPolygon: req.body.polygon,
      imageUrl,
    };

    const inventory = await inventoryService.createInventory(payload);
    return ApiResponse.success(res, HTTP_STATUS.CREATED, 'Inventory created successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const getAllInventories = async (req, res, next) => {
  try {
    const { page, limit, developerId, sectorId } = req.query;
    // NOTE: `developerId` naam frontend chip filter ke saath backward
    // compatibility ke liye rakha gaya hai — actually ye ab GroupId hai,
    // service layer isko groupId mein map karti hai.
    const result = await inventoryService.getAllInventories({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      developerId: developerId ? parseInt(developerId, 10) : undefined,
      sectorId: sectorId ? parseInt(sectorId, 10) : undefined,
    });
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventories fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventoryById(parseInt(req.params.id, 10));
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory fetched successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    // IMPORTANT: sirf wahi fields include karte hain jo form ne actually
    // bheji hain. Missing fields ko null/undefined default nahi karte —
    // service layer decide karti hai key present hai ya nahi ke basis pe.
    const payload = {};

    if (req.body.groupNames !== undefined) payload.groupNames = parseGroupNames(req.body.groupNames); // Grouping
    if (req.body.sectorName !== undefined) payload.sectorName = req.body.sectorName;
    if (req.body.name !== undefined) payload.inventoryName = req.body.name; // Project
    if (req.body.block !== undefined) payload.block = req.body.block;
    if (req.body.actualDeveloperName !== undefined) payload.inventoryDeveloperName = req.body.actualDeveloperName; // Developer
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.googleMapUrl !== undefined) payload.googleMapUrl = req.body.googleMapUrl;
    if (req.body.polygon !== undefined) payload.googleMapPolygon = req.body.polygon;

    // Sirf tab imageUrl touch karte hain jab naya file actually upload hui ho.
    // Naya file nahi hai to imageUrl bhejte hi nahi — isse purani image safe rehti hai.
    if (req.file) {
      payload.imageUrl = `/uploads/${req.file.filename}`;
    }

    const inventory = await inventoryService.updateInventory(parseInt(req.params.id, 10), payload);
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory updated successfully', inventory);
  } catch (err) {
    next(err);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.deleteInventory(parseInt(req.params.id, 10));
    return ApiResponse.success(res, HTTP_STATUS.OK, 'Inventory deleted successfully', inventory);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};