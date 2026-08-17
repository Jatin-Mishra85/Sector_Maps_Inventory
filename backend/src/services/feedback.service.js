const feedbackRepository = require('../repositories/feedback.repository');

function validate(rating, message) {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
        const err = new Error('Rating must be between 1 and 5.');
        err.statusCode = 400;
        throw err;
    }
    const trimmed = typeof message === 'string' ? message.trim() : '';
    if (!trimmed) {
        const err = new Error('Feedback message is required.');
        err.statusCode = 400;
        throw err;
    }
    if (trimmed.length > 1000) {
        const err = new Error('Message must be 1000 characters or fewer.');
        err.statusCode = 400;
        throw err;
    }
    return { rating: r, message: trimmed };
}

async function submitFeedback(userId, rating, message) {
    const { rating: r, message: m } = validate(rating, message);
    return feedbackRepository.createFeedback(userId, r, m);
}

async function getAllFeedbacks() {
    return feedbackRepository.getAllFeedbacks();
}

module.exports = { submitFeedback, getAllFeedbacks };