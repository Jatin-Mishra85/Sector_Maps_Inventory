// backend/repositories/developer.repository.js
//
// This file only talks to the database. No business logic lives here.
// ⚠️ This import path is a PLACEHOLDER — change it to wherever your real
// connectDB/getPool/closeDB file actually lives (e.g. '../database/connection').
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Developers ORDER BY DeveloperId');
    return result.recordset;
}

async function getById(developerId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('DeveloperId', sql.Int, developerId)
        .query('SELECT * FROM Developers WHERE DeveloperId = @DeveloperId');
    return result.recordset[0] || null;
}

async function create(developerName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('DeveloperName', sql.NVarChar(255), developerName)
        .query(`
            INSERT INTO Developers (DeveloperName)
            OUTPUT INSERTED.*
            VALUES (@DeveloperName)
        `);
    return result.recordset[0];
}

async function update(developerId, developerName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('DeveloperId', sql.Int, developerId)
        .input('DeveloperName', sql.NVarChar(255), developerName)
        .query(`
            UPDATE Developers
            SET DeveloperName = @DeveloperName
            OUTPUT INSERTED.*
            WHERE DeveloperId = @DeveloperId
        `);
    return result.recordset[0] || null;
}

async function remove(developerId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('DeveloperId', sql.Int, developerId)
        .query('DELETE FROM Developers WHERE DeveloperId = @DeveloperId');
    return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove };