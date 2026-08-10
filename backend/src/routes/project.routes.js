// backend/routes/project.routes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);

router.post('/', requireAdmin, projectController.create);
router.put('/:id', requireAdmin, projectController.update);
router.delete('/:id', requireAdmin, projectController.remove);

module.exports = router;