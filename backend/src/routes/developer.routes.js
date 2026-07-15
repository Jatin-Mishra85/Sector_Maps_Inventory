// backend/routes/developer.routes.js
//
// Defines the URLs for this entity.
// Mount this in your main app file, e.g.:
//   const developerRoutes = require('./routes/developer.routes');
//   app.use('/api/developers', developerRoutes);
const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developer.controller');

router.get('/', developerController.getAll);
router.get('/:id', developerController.getById);
router.post('/', developerController.create);
router.put('/:id', developerController.update);
router.delete('/:id', developerController.remove);

module.exports = router;