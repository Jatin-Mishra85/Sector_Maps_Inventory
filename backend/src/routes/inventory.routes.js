// backend/routes/inventory.routes.js
// Mount in app.js: app.use('/api/inventory', require('./routes/inventory.routes'));
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.remove);

module.exports = router;