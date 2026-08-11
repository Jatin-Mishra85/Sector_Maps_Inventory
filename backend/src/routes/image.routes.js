// backend/routes/image.routes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', imageController.getAll);
router.get('/:id', imageController.getById);

router.post('/', requireAdmin, imageController.create);
router.put('/:id', requireAdmin, imageController.update);
router.delete('/:id', requireAdmin, imageController.remove);

module.exports = router;