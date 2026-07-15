const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);
router.post('/', groupController.create);
router.put('/:id', groupController.update);
router.delete('/:id', groupController.remove);

router.post('/add-inventories', groupController.addInventoriesToGroup);
router.post('/remove-inventories', groupController.removeInventoriesFromGroup);

module.exports = router;