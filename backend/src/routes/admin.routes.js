const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

router.get('/users', requireSuperAdmin, adminController.getAllUsers);
router.patch('/users/:userId/toggle-admin', requireSuperAdmin, adminController.toggleAdmin);
router.patch('/users/:userId/toggle-block', requireSuperAdmin, adminController.toggleBlock);

module.exports = router;