const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search.controller');
const { searchInventoriesValidator } = require('../validators/inventory.validator');

router.get('/inventories', searchInventoriesValidator, searchController.searchInventories);
router.get('/suggest', searchController.suggestInventories);

module.exports = router;