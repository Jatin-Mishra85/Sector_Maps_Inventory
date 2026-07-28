const express = require('express');
const router = express.Router();

const interactionsController = require('../controllers/interactions.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Sabhi routes login zaroori hain — bina login save/unsave/report nahi kar sakte
router.post('/save', requireAuth, interactionsController.saveInventory);
router.delete('/unsave/:inventoryId', requireAuth, interactionsController.unsaveInventory);
router.get('/saved', requireAuth, interactionsController.getSavedIds);
router.post('/report', requireAuth, interactionsController.reportInventory);

module.exports = router;