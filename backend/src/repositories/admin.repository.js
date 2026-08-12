const { getPool, sql } = require('../database/connection');

async function getAllUsers() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT UserId, Email, Name, Picture, CreatedAt, IsAdmin, IsSuperAdmin, IsBlocked
        FROM Users
        ORDER BY CreatedAt DESC
    `);
    return result.recordset;
}

async function findById(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query('SELECT * FROM Users WHERE UserId = @UserId');
    return result.recordset[0] || null;
}

async function toggleAdmin(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(`
            UPDATE Users
            SET IsAdmin = CASE WHEN IsAdmin = 1 THEN 0 ELSE 1 END
            OUTPUT INSERTED.*
            WHERE UserId = @UserId
        `);
    return result.recordset[0] || null;
}

async function toggleBlock(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(`
            UPDATE Users
            SET IsBlocked = CASE WHEN IsBlocked = 1 THEN 0 ELSE 1 END
            OUTPUT INSERTED.*
            WHERE UserId = @UserId
        `);
    return result.recordset[0] || null;
}

module.exports = { getAllUsers, findById, toggleAdmin, toggleBlock };