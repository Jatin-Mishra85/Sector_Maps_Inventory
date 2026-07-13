const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

router.get('/', groupController.getAllGroups);
router.post('/add-inventories', groupController.addInventoriesToGroup);
router.post('/remove-inventories', groupController.removeInventoriesFromGroup);

module.exports = router;