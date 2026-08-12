function requireSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    if (!req.user.isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
    }
    next();
}

module.exports = requireSuperAdmin;