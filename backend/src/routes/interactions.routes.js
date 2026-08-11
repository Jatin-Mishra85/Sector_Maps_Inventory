const express = require('express');
const router = express.Router();

const interactionsController = require('../controllers/interactions.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// Save/unsave/saved list ke liye login zaroori hai.
router.post('/save', requireAuth, interactionsController.saveInventory);
router.delete('/unsave/:inventoryId', requireAuth, interactionsController.unsaveInventory);
router.get('/saved', requireAuth, interactionsController.getSavedIds);

// Report ke liye login zaroori nahi — bina login bhi report kiya ja sakta hai.
router.post('/report', interactionsController.reportInventory);

// Sirf admin ke liye — saare reports table format me dekhne ke liye.
router.get('/reports', requireAdmin, interactionsController.getAllReports);

module.exports = router;