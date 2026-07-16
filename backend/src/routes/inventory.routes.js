// backend/src/routes/inventory.routes.js
// Mount in app.js: app.use('/api/inventory', require('./routes/inventory.routes'));
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const upload = require('../config/multer.config');

router.get('/', inventoryController.getAll);

// IMPORTANT: yeh route '/:id' se PEHLE hona chahiye, warna Express 'next-card-number'
// ko :id ki value samajh ke getById() ko bhej dega.
router.get('/next-card-number', inventoryController.getNextCardNumber);

router.get('/:id', inventoryController.getById);

// upload.none() — Developer Batch form koi file nahi bhejta, sirf text fields
// (actualDeveloperName, sectorName, name, cardId) multipart/form-data mein bhejta hai.
// Iske bina Express req.body khaali reh jata hai, isliye sab "required" errors aate the.
router.post('/', upload.none(), inventoryController.create);
router.put('/:id', upload.none(), inventoryController.update);

router.delete('/:id', inventoryController.remove);

module.exports = router;