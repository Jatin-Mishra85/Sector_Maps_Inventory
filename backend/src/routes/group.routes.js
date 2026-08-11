const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);

router.post('/', requireAdmin, groupController.create);
router.put('/:id', requireAdmin, groupController.update);
router.delete('/:id', requireAdmin, groupController.remove);

router.post('/add-inventories', requireAdmin, groupController.addInventoriesToGroup);
router.post('/remove-inventories', requireAdmin, groupController.removeInventoriesFromGroup);

module.exports = router;