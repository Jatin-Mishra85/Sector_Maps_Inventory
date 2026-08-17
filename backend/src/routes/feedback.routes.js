const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Public — login required nahi, koi bhi feedback de sakta hai aur list dekh sakta hai.
router.post('/', feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedbacks);

module.exports = router;