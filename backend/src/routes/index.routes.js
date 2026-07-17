const express = require('express');
const router = express.Router();

const developerRoutes = require('./developer.routes');
const sectorRoutes = require('./sector.routes');
const projectRoutes = require('./project.routes');
const groupRoutes = require('./group.routes');
const inventoryRoutes = require('./inventory.routes');
const imageRoutes = require('./image.routes');
const inventoryGroupRoutes = require('./inventoryGroup.routes');
const adminRoutes = require('./admin.routes');
const searchRoutes = require('./search.routes');

router.use('/developers', developerRoutes);
router.use('/sectors', sectorRoutes);
router.use('/projects', projectRoutes);
router.use('/groups', groupRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/images', imageRoutes);
router.use('/inventory-groups', inventoryGroupRoutes);
router.use('/admin', adminRoutes);
router.use('/search', searchRoutes);

module.exports = router;