const express = require('express');
const router = express.Router();

const groupRoutes = require('./group.routes');
const sectorRoutes = require('./sector.routes');
const inventoryRoutes = require('./inventory.routes');
const searchRoutes = require('./search.routes');

router.use('/groups', groupRoutes);
router.use('/sectors', sectorRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/search', searchRoutes);

module.exports = router;