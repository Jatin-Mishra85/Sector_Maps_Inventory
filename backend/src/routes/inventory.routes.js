const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');
const {
  createInventoryValidator,
  updateInventoryValidator,
  inventoryIdParamValidator,
  getAllInventoriesValidator,
} = require('../validators/inventory.validator');

router.post('/', createInventoryValidator, inventoryController.createInventory);
router.get('/', getAllInventoriesValidator, inventoryController.getAllInventories);
router.get('/:id', inventoryIdParamValidator, inventoryController.getInventoryById);
router.put('/:id', updateInventoryValidator, inventoryController.updateInventory);
router.delete('/:id', inventoryIdParamValidator, inventoryController.deleteInventory);

module.exports = router;