const { getPool, sql } = require('../database/connection');

async function findByGoogleId(googleId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GoogleId', sql.NVarChar(255), googleId)
        .query('SELECT * FROM Users WHERE GoogleId = @GoogleId');
    return result.recordset[0] || null;
}

async function findById(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query('SELECT * FROM Users WHERE UserId = @UserId');
    return result.recordset[0] || null;
}

async function createUser({ googleId, email, name, picture }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GoogleId', sql.NVarChar(255), googleId)
        .input('Email', sql.NVarChar(255), email)
        .input('Name', sql.NVarChar(255), name)
        .input('Picture', sql.NVarChar(500), picture || null)
        .query(`
            INSERT INTO Users (GoogleId, Email, Name, Picture)
            OUTPUT INSERTED.*
            VALUES (@GoogleId, @Email, @Name, @Picture)
        `);
    return result.recordset[0];
}

module.exports = { findByGoogleId, findById, createUser };