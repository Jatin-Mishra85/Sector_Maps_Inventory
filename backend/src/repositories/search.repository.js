const { getPool, sql } = require('../database/connection');

// Developer name, Sector name, Project name, aur Group name — in charo par
// keyword search karta hai. Group many-to-many hai (InventoryGroups ke through),
// isliye EXISTS use kiya hai — LEFT JOIN se duplicate Inventory rows aa jaate.
function buildWhereClause(hasInventoryType) {
    let clause = `
        WHERE (
            d.DeveloperName LIKE @Keyword
            OR s.SectorName LIKE @Keyword
            OR p.ProjectName LIKE @Keyword
            OR EXISTS (
                SELECT 1
                FROM InventoryGroups ig
                JOIN Groups g ON g.GroupId = ig.GroupId
                WHERE ig.InventoryId = i.InventoryId AND g.GroupName LIKE @Keyword
            )
        )
    `;
    if (hasInventoryType) {
        // ⚠️ ASSUMPTION: inventoryType → i.UnitType. Agar galat column hai,
        // yahan sirf "i.UnitType" ko sahi column se replace karo.
        clause += ' AND i.UnitType = @InventoryType';
    }
    return clause;
}

async function searchInventories({ keyword, inventoryType, offset, limit }) {
    const pool = await getPool();
    const term = `%${(keyword || '').trim()}%`;
    const whereClause = buildWhereClause(Boolean(inventoryType));

    const countRequest = pool.request().input('Keyword', sql.NVarChar(255), term);
    if (inventoryType) countRequest.input('InventoryType', sql.NVarChar(255), inventoryType);

    const countResult = await countRequest.query(`
        SELECT COUNT(DISTINCT i.InventoryId) AS Total
        FROM Inventory i
        LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
        LEFT JOIN Sectors s ON s.SectorId = i.SectorId
        LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
        ${whereClause}
    `);
    const total = countResult.recordset[0]?.Total || 0;

    const dataRequest = pool.request()
        .input('Keyword', sql.NVarChar(255), term)
        .input('Offset', sql.Int, offset)
        .input('Limit', sql.Int, limit);
    if (inventoryType) dataRequest.input('InventoryType', sql.NVarChar(255), inventoryType);

    const dataResult = await dataRequest.query(`
        SELECT DISTINCT i.*, d.DeveloperName, s.SectorName, p.ProjectName
        FROM Inventory i
        LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
        LEFT JOIN Sectors s ON s.SectorId = i.SectorId
        LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
        ${whereClause}
        ORDER BY i.DisplaySequence
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

    return { items: dataResult.recordset, total };
}

// Autocomplete/suggestions — har category (Developer/Sector/Project/Group)
// se matching naam, category ke hisaab se grouped.
async function suggestInventories({ keyword, limitPerCategory }) {
    const pool = await getPool();
    const term = `%${(keyword || '').trim()}%`;

    const developers = await pool.request()
        .input('Keyword', sql.NVarChar(255), term)
        .input('Limit', sql.Int, limitPerCategory)
        .query('SELECT TOP (@Limit) DeveloperId, DeveloperName FROM Developers WHERE DeveloperName LIKE @Keyword ORDER BY DeveloperName');

    const sectors = await pool.request()
        .input('Keyword', sql.NVarChar(255), term)
        .input('Limit', sql.Int, limitPerCategory)
        .query('SELECT TOP (@Limit) SectorId, SectorName FROM Sectors WHERE SectorName LIKE @Keyword ORDER BY SectorName');

    const projects = await pool.request()
        .input('Keyword', sql.NVarChar(255), term)
        .input('Limit', sql.Int, limitPerCategory)
        .query('SELECT TOP (@Limit) ProjectId, ProjectName FROM Projects WHERE ProjectName LIKE @Keyword ORDER BY ProjectName');

    const groups = await pool.request()
        .input('Keyword', sql.NVarChar(255), term)
        .input('Limit', sql.Int, limitPerCategory)
        .query('SELECT TOP (@Limit) GroupId, GroupName FROM Groups WHERE GroupName LIKE @Keyword ORDER BY GroupName');

    return {
        developers: developers.recordset,
        sectors: sectors.recordset,
        projects: projects.recordset,
        groups: groups.recordset,
    };
}

module.exports = { searchInventories, suggestInventories };