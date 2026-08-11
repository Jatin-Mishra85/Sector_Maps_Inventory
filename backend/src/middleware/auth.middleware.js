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

// Koi bhi logged-in user (normal ya special) -- sirf login hona check karta hai.
// Use karo un actions ke liye jo har logged-in user kar sake, jaise save/bookmark.
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    next();
}

// Sirf DB me IsAdmin=1 wale users -- manually SSMS se set karna hota hai.
// Add/edit/delete jaise write actions ke liye use karo.
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    if (!req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
    }
    next();
}

module.exports = { attachUser, requireAuth, requireAdmin };