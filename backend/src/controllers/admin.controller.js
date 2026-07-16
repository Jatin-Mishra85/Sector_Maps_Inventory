const adminService = require('../services/admin.service');

async function verifyCode(req, res) {
    try {
        const { code } = req.body;
        adminService.verifyCode(code); // throws if missing/invalid
        return res.status(200).json({ success: true, message: 'Admin code verified.' });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
}

module.exports = { verifyCode };