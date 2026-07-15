// backend/repositories/sector.repository.js
// ⚠️ Adjust this import path to match your real db connection file.
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Sectors ORDER BY SectorId');
    return result.recordset;
}

async function getById(sectorId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('SectorId', sql.Int, sectorId)
        .query('SELECT * FROM Sectors WHERE SectorId = @SectorId');
    return result.recordset[0] || null;
}

async function create(sectorName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('SectorName', sql.NVarChar(255), sectorName)
        .query(`
            INSERT INTO Sectors (SectorName)
            OUTPUT INSERTED.*
            VALUES (@SectorName)
        `);
    return result.recordset[0];
}

async function update(sectorId, sectorName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('SectorId', sql.Int, sectorId)
        .input('SectorName', sql.NVarChar(255), sectorName)
        .query(`
            UPDATE Sectors
            SET SectorName = @SectorName
            OUTPUT INSERTED.*
            WHERE SectorId = @SectorId
        `);
    return result.recordset[0] || null;
}

async function remove(sectorId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('SectorId', sql.Int, sectorId)
        .query('DELETE FROM Sectors WHERE SectorId = @SectorId');
    return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove };