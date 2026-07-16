const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.post('/verify-code', adminController.verifyCode);

module.exports = router;