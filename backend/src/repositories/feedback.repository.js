const { getPool, sql } = require('../database/connection');

async function createFeedback(userId, rating, message) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .input('Rating', sql.Int, rating)
        .input('Message', sql.NVarChar(1000), message)
        .query(`
            INSERT INTO Feedbacks (UserId, Rating, Message)
            OUTPUT INSERTED.FeedbackId
            VALUES (@UserId, @Rating, @Message)
        `);
    return result.recordset[0].FeedbackId;
}

async function getAllFeedbacks() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT f.FeedbackId, f.Rating, f.Message, f.CreatedAt,
               u.Name AS UserName, u.Picture AS UserPicture
        FROM Feedbacks f
        LEFT JOIN Users u ON u.UserId = f.UserId
        ORDER BY f.CreatedAt DESC
    `);
    return result.recordset;
}

module.exports = { createFeedback, getAllFeedbacks };