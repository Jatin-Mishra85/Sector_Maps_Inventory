// backend/routes/sector.routes.js
const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sector.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', sectorController.getAllSectors);
router.get('/:id', sectorController.getSectorById);

router.post('/', requireAdmin, sectorController.createSector);
router.put('/:id', requireAdmin, sectorController.updateSector);
router.delete('/:id', requireAdmin, sectorController.deleteSector);

module.exports = router;