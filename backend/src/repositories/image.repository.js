// backend/repositories/image.repository.js
// ⚠️ Adjust this import path to match your real db connection file.
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Images ORDER BY ImageId');
    return result.recordset;
}

async function getById(imageId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ImageId', sql.Int, imageId)
        .query('SELECT * FROM Images WHERE ImageId = @ImageId');
    return result.recordset[0] || null;
}

async function create(imagePath) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ImagePath', sql.NVarChar(500), imagePath)
        .query(`
            INSERT INTO Images (ImagePath)
            OUTPUT INSERTED.*
            VALUES (@ImagePath)
        `);
    return result.recordset[0];
}

async function update(imageId, imagePath) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ImageId', sql.Int, imageId)
        .input('ImagePath', sql.NVarChar(500), imagePath)
        .query(`
            UPDATE Images
            SET ImagePath = @ImagePath
            OUTPUT INSERTED.*
            WHERE ImageId = @ImageId
        `);
    return result.recordset[0] || null;
}

async function remove(imageId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('ImageId', sql.Int, imageId)
        .query('DELETE FROM Images WHERE ImageId = @ImageId');
    return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove }; 