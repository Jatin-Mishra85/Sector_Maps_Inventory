const adminRepository = require('../repositories/admin.repository');

function mapUserRow(row) {
    return {
        userId: row.UserId,
        email: row.Email,
        name: row.Name,
        picture: row.Picture,
        createdAt: row.CreatedAt,
        isAdmin: !!row.IsAdmin,
        isSuperAdmin: !!row.IsSuperAdmin,
        isBlocked: !!row.IsBlocked,
    };
}

async function getAllUsers() {
    const rows = await adminRepository.getAllUsers();
    return rows.map(mapUserRow);
}

async function toggleAdmin(userId) {
    const target = await adminRepository.findById(userId);
    if (!target) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }
    if (target.IsSuperAdmin) {
        const err = new Error('SuperAdmin ka admin status change nahi kar sakte.');
        err.statusCode = 400;
        throw err;
    }
    const updated = await adminRepository.toggleAdmin(userId);
    return mapUserRow(updated);
}

async function toggleBlock(userId) {
    const target = await adminRepository.findById(userId);
    if (!target) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }
    if (target.IsSuperAdmin) {
        const err = new Error('SuperAdmin ko block nahi kar sakte.');
        err.statusCode = 400;
        throw err;
    }
    const updated = await adminRepository.toggleBlock(userId);
    return mapUserRow(updated);
}

module.exports = { getAllUsers, toggleAdmin, toggleBlock };