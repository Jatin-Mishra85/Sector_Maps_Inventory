const express = require('express');
const router = express.Router();

const sectorController = require('../controllers/sector.controller');
const {
  createSectorValidator,
  updateSectorValidator,
  sectorIdParamValidator,
  getAllSectorsValidator,
} = require('../validators/sector.validator');

router.post('/', createSectorValidator, sectorController.createSector);
router.get('/', getAllSectorsValidator, sectorController.getAllSectors);
router.get('/:id', sectorIdParamValidator, sectorController.getSectorById);
router.put('/:id', updateSectorValidator, sectorController.updateSector);
router.delete('/:id', sectorIdParamValidator, sectorController.deleteSector);

module.exports = router;