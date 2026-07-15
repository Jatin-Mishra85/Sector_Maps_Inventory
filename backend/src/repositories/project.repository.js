// backend/repositories/project.repository.js
// ⚠️ Adjust this import path to match your real db connection file.
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Projects ORDER BY ProjectId');
    return result.recordset;
}

async function getById(projectId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ProjectId', sql.Int, projectId)
        .query('SELECT * FROM Projects WHERE ProjectId = @ProjectId');
    return result.recordset[0] || null;
}

async function create(projectName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ProjectName', sql.NVarChar(255), projectName)
        .query(`
            INSERT INTO Projects (ProjectName)
            OUTPUT INSERTED.*
            VALUES (@ProjectName)
        `);
    return result.recordset[0];
}

async function update(projectId, projectName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ProjectId', sql.Int, projectId)
        .input('ProjectName', sql.NVarChar(255), projectName)
        .query(`
            UPDATE Projects
            SET ProjectName = @ProjectName
            OUTPUT INSERTED.*
            WHERE ProjectId = @ProjectId
        `);
    return result.recordset[0] || null;
}

async function remove(projectId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ProjectId', sql.Int, projectId)
        .query('DELETE FROM Projects WHERE ProjectId = @ProjectId');
    return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove };