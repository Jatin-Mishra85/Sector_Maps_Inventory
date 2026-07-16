  const searchRepository = require('../repositories/search.repository');

async function searchInventories({ keyword, inventoryType, page, limit }) {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 20;
    const offset = (safePage - 1) * safeLimit;

    const { items, total } = await searchRepository.searchInventories({
        keyword,
        inventoryType,
        offset,
        limit: safeLimit,
    });

    return {
        items,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 0,
    };
}

async function suggestInventories({ keyword, limitPerCategory }) {
    if (!keyword || !keyword.trim()) {
        return { developers: [], sectors: [], projects: [], groups: [] };
    }
    return searchRepository.suggestInventories({ keyword, limitPerCategory });
}

module.exports = { searchInventories, suggestInventories };