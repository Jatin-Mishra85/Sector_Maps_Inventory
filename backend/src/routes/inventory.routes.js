const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const upload = require('../config/multer.config');
const { requireAdmin } = require('../middleware/auth.middleware');

// View — sabke liye open (login ho ya na ho).
router.get('/', inventoryController.getAll);

// IMPORTANT: yeh route '/:id' se PEHLE hona chahiye, warna Express 'next-card-number'
// ko :id ki value samajh ke getById() ko bhej dega.
router.get('/next-card-number', inventoryController.getNextCardNumber);

router.get('/:id', inventoryController.getById);

// Write actions — sirf "special" account (IsAdmin) hi kar sakta hai.
router.post('/', requireAdmin, upload.single('image'), inventoryController.create);
router.put('/:id', requireAdmin, upload.single('image'), inventoryController.update);
router.delete('/:id', requireAdmin, inventoryController.remove);

module.exports = router;