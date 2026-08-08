const { getPool, sql } = require('../database/connection');

// Keyword ko words mein todo — combo search ("Sector 84 BPTP") ke liye
// har word alag se match hona chahiye, chahe wo alag-alag column/table mein ho.
function getSearchWords(keyword) {
    return (keyword || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

// Word ko normalize karo — spaces hata do, taaki "district1" aur "district 1"
// dono same treat hon. Column values ko bhi query mein REPLACE(..., ' ', '')
// se normalize kiya jaata hai, taaki dono sides consistent rahein.
function normalizeWord(word) {
    return (word || '').replace(/\s+/g, '');
}

// Har word ke liye: (Developer OR Sector OR Project OR Group naam mein match ho)
// — saare words ka AND. Isse "Sector 84 BPTP" jaisa combo bhi kaam karega,
// chahe "Sector 84" Sector table mein ho aur "BPTP" alag se Developer table mein.
// REPLACE(..., ' ', '') dono taraf lagaya hai taaki space ho ya na ho, match ho jaaye
// (e.g. "district1" query "District 1" naam se match kare).
function buildWordConditions(words, hasInventoryType) {
    const wordClauses = words.map((_, idx) => `
        (
            REPLACE(d.DeveloperName, ' ', '') LIKE @Word${idx}
            OR REPLACE(s.SectorName, ' ', '') LIKE @Word${idx}
            OR REPLACE(p.ProjectName, ' ', '') LIKE @Word${idx}
            OR EXISTS (
                SELECT 1 FROM InventoryGroups ig
                JOIN Groups g ON g.GroupId = ig.GroupId
                WHERE ig.InventoryId = i.InventoryId AND REPLACE(g.GroupName, ' ', '') LIKE @Word${idx}
            )
        )
    `);

    let clause = wordClauses.length ? `WHERE ${wordClauses.join(' AND ')}` : 'WHERE 1=1';
    if (hasInventoryType) {
        // ⚠️ ASSUMPTION: inventoryType → i.UnitType (jaisa pehle tha)
        clause += ' AND i.UnitType = @InventoryType';
    }
    return clause;
}

async function searchInventories({ keyword, inventoryType, offset, limit }) {
    const pool = await getPool();
    const words = getSearchWords(keyword);
    const whereClause = buildWordConditions(words, Boolean(inventoryType));

    const countRequest = pool.request();
    words.forEach((w, idx) => countRequest.input(`Word${idx}`, sql.NVarChar(255), `%${normalizeWord(w)}%`));
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
        .input('Offset', sql.Int, offset)
        .input('Limit', sql.Int, limit);
    words.forEach((w, idx) => dataRequest.input(`Word${idx}`, sql.NVarChar(255), `%${normalizeWord(w)}%`));
    if (inventoryType) dataRequest.input('InventoryType', sql.NVarChar(255), inventoryType);

    // NOTE: SQL Server 2008 R2 (compatibility level 100) OFFSET/FETCH support
    // nahi karta, isliye ROW_NUMBER() window function se manual pagination.
    const dataResult = await dataRequest.query(`
        SELECT * FROM (
            SELECT i.*, d.DeveloperName, s.SectorName, p.ProjectName, img.ImagePath,
                   ROW_NUMBER() OVER (ORDER BY i.DisplaySequence) AS RowNum
            FROM Inventory i
            LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
            LEFT JOIN Sectors s ON s.SectorId = i.SectorId
            LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
            LEFT JOIN Images img ON img.ImageId = i.ImageId
            ${whereClause}
        ) AS Results
        WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
        ORDER BY RowNum
    `);

    return { items: dataResult.recordset, total };
}

// Autocomplete — ab EK flat list deta hai: [{ Id, Name, Category }, ...]
// Category = 'Developer' | 'Sector' | 'Project' | 'Group'
async function suggestInventories({ keyword, limitPerCategory }) {
    const pool = await getPool();
    const words = getSearchWords(keyword);
    if (!words.length) {
        return { items: [], fuzzy: false };
    }

    // Ek hi Name column ke andar saare words match hone chahiye
    // (matlab "Sector 84" type ka partial multi-word naam bhi pakdega).
    // REPLACE(Name, ' ', '') se Name column ke spaces bhi hata diye jaate hain,
    // taaki "district1" query "District 1" naam se bhi match ho jaaye.
    const wordClause = words.map((_, idx) => `REPLACE(Name, ' ', '') LIKE @Word${idx}`).join(' AND ');

    const exactRequest = pool.request().input('Limit', sql.Int, limitPerCategory * 4);
    words.forEach((w, idx) => exactRequest.input(`Word${idx}`, sql.NVarChar(255), `%${normalizeWord(w)}%`));

    const exactResult = await exactRequest.query(`
        ;WITH Combined AS (
            SELECT DeveloperId AS Id, DeveloperName AS Name, 'Developer' AS Category FROM Developers
            UNION ALL
            SELECT SectorId, SectorName, 'Sector' FROM Sectors
            UNION ALL
            SELECT ProjectId, ProjectName, 'Project' FROM Projects
            UNION ALL
            SELECT GroupId, GroupName, 'Group' FROM Groups
        )
        SELECT TOP (@Limit) Id, Name, Category
        FROM Combined
        WHERE ${wordClause}
        ORDER BY Name
    `);

    if (exactResult.recordset.length) {
        return { items: exactResult.recordset, fuzzy: false };
    }

    // Exact match kuch nahi mila — "did you mean" fuzzy fallback.
    // SOUNDEX = "sounds like" match, DIFFERENCE = 0-4 ka similarity score
    // (4 = bahut close). Special characters ki chinta nahi, ye sirf letters
    // ki dhwani/pattern compare karta hai — bina kisi extra library ke.
    const lastWord = words[words.length - 1];
    const fuzzyRequest = pool.request()
        .input('Limit', sql.Int, limitPerCategory)
        .input('Term', sql.NVarChar(255), lastWord);

    const fuzzyResult = await fuzzyRequest.query(`
        ;WITH Combined AS (
            SELECT DeveloperId AS Id, DeveloperName AS Name, 'Developer' AS Category FROM Developers
            UNION ALL
            SELECT SectorId, SectorName, 'Sector' FROM Sectors
            UNION ALL
            SELECT ProjectId, ProjectName, 'Project' FROM Projects
            UNION ALL
            SELECT GroupId, GroupName, 'Group' FROM Groups
        )
        SELECT TOP (@Limit) Id, Name, Category
        FROM Combined
        WHERE SOUNDEX(Name) = SOUNDEX(@Term)
           OR DIFFERENCE(Name, @Term) >= 3
        ORDER BY Name
    `);

    return { items: fuzzyResult.recordset, fuzzy: true };
}

module.exports = { searchInventories, suggestInventories };