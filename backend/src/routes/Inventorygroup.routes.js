// backend/routes/Inventorygroup.routes.js
const express = require('express');
const router = express.Router();
const inventoryGroupController = require('../controllers/inventorygroup.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/inventory/:inventoryId', inventoryGroupController.getGroupsForInventory); // groups tagged on one inventory
router.get('/group/:groupId', inventoryGroupController.getInventoryForGroup);          // inventory items tagged with one group

router.post('/', requireAdmin, inventoryGroupController.addMapping);                    // body: { inventoryId, groupId }
router.delete('/:inventoryId/:groupId', requireAdmin, inventoryGroupController.removeMapping);

module.exports = router;