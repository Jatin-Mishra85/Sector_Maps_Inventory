const adminService = require('../services/admin.service');

async function getAllUsers(req, res) {
    try {
        const users = await adminService.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
}

async function toggleAdmin(req, res) {
    try {
        const user = await adminService.toggleAdmin(req.params.userId);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
}

async function toggleBlock(req, res) {
    try {
        const user = await adminService.toggleBlock(req.params.userId);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
}

module.exports = { getAllUsers, toggleAdmin, toggleBlock };