const express = require('express');
const router = express.Router();

const developerController = require('../controllers/developer.controller');
const {
  createDeveloperValidator,
  updateDeveloperValidator,
  developerIdParamValidator,
  getAllDevelopersValidator,
} = require('../validators/developer.validator');

router.post('/', createDeveloperValidator, developerController.createDeveloper);
router.get('/', getAllDevelopersValidator, developerController.getAllDevelopers);
router.get('/:id', developerIdParamValidator, developerController.getDeveloperById);
router.put('/:id', updateDeveloperValidator, developerController.updateDeveloper);
router.delete('/:id', developerIdParamValidator, developerController.deleteDeveloper);

module.exports = router;