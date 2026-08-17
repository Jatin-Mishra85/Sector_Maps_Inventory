const feedbackService = require('../services/feedback.service');

async function submitFeedback(req, res) {
    try {
        const userId = req.user?.userId || null;
        await feedbackService.submitFeedback(userId, req.body.rating, req.body.message);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

async function getAllFeedbacks(req, res) {
    try {
        const feedbacks = await feedbackService.getAllFeedbacks();
        res.status(200).json({ success: true, data: feedbacks });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
}

module.exports = { submitFeedback, getAllFeedbacks };