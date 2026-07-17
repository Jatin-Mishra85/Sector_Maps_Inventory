// backend/src/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const upload = require('../config/multer.config');

router.get('/', inventoryController.getAll);

// IMPORTANT: yeh route '/:id' se PEHLE hona chahiye, warna Express 'next-card-number'
// ko :id ki value samajh ke getById() ko bhej dega.
router.get('/next-card-number', inventoryController.getNextCardNumber);

router.get('/:id', inventoryController.getById);

// Developer Batch (Add Inventory) — sirf text fields, koi file nahi.
router.post('/', upload.none(), inventoryController.create);

// Edit Inventory (purana modal) — optional 'image' file field bhejta hai.
// upload.single('image') text fields ko bhi parse karta hai (req.body) aur
// agar 'image' field mile to req.file mein daal deta hai; agar na mile, fine hai.
router.put('/:id', upload.single('image'), inventoryController.update);

router.delete('/:id', inventoryController.remove);

module.exports = router;