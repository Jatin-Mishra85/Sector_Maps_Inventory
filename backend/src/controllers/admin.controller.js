const jwt = require('jsonwebtoken');
const adminService = require('../services/admin.service');

const ADMIN_COOKIE_NAME = 'admin_access';

function adminCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    };
}

async function verifyCode(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Please log in first.' });
        }

        const { code } = req.body;
        adminService.verifyCode(code); // throws if missing/invalid

        const adminToken = jwt.sign(
            { admin: true, userId: req.user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie(ADMIN_COOKIE_NAME, adminToken, adminCookieOptions());

        return res.status(200).json({ success: true, message: 'Admin code verified.' });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
}

// Naya -- page load / refresh par frontend ye call karega taaki pata chale
// admin_access cookie abhi bhi valid hai ya nahi (cookie httpOnly hai,
// JS se seedha read nahi ho sakti).
async function getStatus(req, res) {
    try {
        const token = req.cookies?.[ADMIN_COOKIE_NAME];
        if (!token) {
            return res.status(200).json({ success: true, data: { unlocked: false } });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ success: true, data: { unlocked: !!decoded.admin } });
    } catch (err) {
        return res.status(200).json({ success: true, data: { unlocked: false } });
    }
}

module.exports = { verifyCode, getStatus };