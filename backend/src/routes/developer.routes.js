// backend/routes/developer.routes.js
const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developer.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', developerController.getAll);
router.get('/:id', developerController.getById);

router.post('/', requireAdmin, developerController.create);
router.put('/:id', requireAdmin, developerController.update);
router.delete('/:id', requireAdmin, developerController.remove);

module.exports = router;