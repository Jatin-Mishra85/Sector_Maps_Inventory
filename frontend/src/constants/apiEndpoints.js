export const API_ENDPOINTS = {
  DEVELOPER: {
    BASE: '/developers',
    BY_ID: (id) => `/developers/${id}`,
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
    SEARCH: '/inventories/search',
    DOWNLOAD: (id) => `/inventories/${id}/download`,
  },
};