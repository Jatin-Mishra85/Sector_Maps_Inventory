const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

async function attachUser(req, res, next) {
    try {
        const token = req.cookies?.auth_token;
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await authService.getUserById(decoded.userId);
        if (user) req.user = user;
        next();
    } catch (err) {
        next();
    }
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    next();
}

module.exports = { attachUser, requireAuth };