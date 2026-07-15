// backend/routes/inventoryGroup.routes.js
// Mount in app.js: app.use('/api/inventory-groups', require('./routes/inventoryGroup.routes'));
const express = require('express');
const router = express.Router();
const inventoryGroupController = require('../controllers/inventoryGroup.controller');

router.get('/inventory/:inventoryId', inventoryGroupController.getGroupsForInventory); // groups tagged on one inventory
router.get('/group/:groupId', inventoryGroupController.getInventoryForGroup);          // inventory items tagged with one group
router.post('/', inventoryGroupController.addMapping);                                  // body: { inventoryId, groupId }
router.delete('/:inventoryId/:groupId', inventoryGroupController.removeMapping);

module.exports = router;