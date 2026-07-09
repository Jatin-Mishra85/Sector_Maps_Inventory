const express = require('express');
const router = express.Router();

const developerRoutes = require('./developer.routes');
const sectorRoutes = require('./sector.routes');
const inventoryRoutes = require('./inventory.routes');
const searchRoutes = require('./search.routes');

router.use('/developers', developerRoutes);
router.use('/sectors', sectorRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/search', searchRoutes);

module.exports = router;