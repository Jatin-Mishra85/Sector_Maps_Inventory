// backend/routes/image.routes.js
// Mount in app.js: app.use('/api/images', require('./routes/image.routes'));
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

router.get('/', imageController.getAll);
router.get('/:id', imageController.getById);
router.post('/', imageController.create);
router.put('/:id', imageController.update);
router.delete('/:id', imageController.remove);

module.exports = router;