export const ALL_TYPES_ID = 'ALL_TYPES';
export const API_ENDPOINTS = {
  GROUP: {
    BASE: '/groups',
    ADD_INVENTORIES: '/groups/add-inventories',
    REMOVE_INVENTORIES: '/groups/remove-inventories',
  },
  SECTOR: {
    BASE: '/sectors',
    BY_ID: (id) => `/sectors/${id}`,
    BY_DEVELOPER: (developerId) => `/developers/${developerId}/sectors`,
  },
  INVENTORY: {
    BASE: '/inventories',
    BY_ID: (id) => `/inventories/${id}`,
    BY_SECTOR: (sectorId) => `/sectors/${sectorId}/inventories`,
    RECENT: '/inventories/recent',
    DOWNLOAD: (id) => `/inventories/${id}/download`,
  },
  SEARCH: {
    INVENTORIES: '/search/inventories',
    SUGGEST: '/search/suggest',
  },
};