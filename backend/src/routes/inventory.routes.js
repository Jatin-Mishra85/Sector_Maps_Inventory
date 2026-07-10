const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');
const upload = require('../config/multer.config');
const {
  createInventoryValidator,
  updateInventoryValidator,
  inventoryIdParamValidator,
  getAllInventoriesValidator,
} = require('../validators/inventory.validator');

router.post('/', upload.single('image'), createInventoryValidator, inventoryController.createInventory);
router.get('/', getAllInventoriesValidator, inventoryController.getAllInventories);
router.get('/:id', inventoryIdParamValidator, inventoryController.getInventoryById);
router.put('/:id', upload.single('image'), updateInventoryValidator, inventoryController.updateInventory);
router.delete('/:id', inventoryIdParamValidator, inventoryController.deleteInventory);

module.exports = router;