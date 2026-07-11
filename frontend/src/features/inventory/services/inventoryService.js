import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const inventoryService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.INVENTORY.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.INVENTORY.BY_ID(id)),
  getBySector: (sectorId) => apiClient.get(API_ENDPOINTS.INVENTORY.BY_SECTOR(sectorId)),
  getRecent: (params) => apiClient.get(API_ENDPOINTS.INVENTORY.RECENT, { params }),
  search: (params) => apiClient.get(API_ENDPOINTS.SEARCH.INVENTORIES, { params }),
  suggest: (keyword) => apiClient.get(API_ENDPOINTS.SEARCH.SUGGEST, { params: { keyword } }),
  create: (payload) => apiClient.post(API_ENDPOINTS.INVENTORY.BASE, payload),
  update: (id, payload) => apiClient.put(API_ENDPOINTS.INVENTORY.BY_ID(id), payload),
  updateWithImage: (id, formData) =>
    apiClient.put(API_ENDPOINTS.INVENTORY.BY_ID(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => apiClient.delete(API_ENDPOINTS.INVENTORY.BY_ID(id)),
  getDownloadUrl: (id) => `${apiClient.defaults.baseURL}${API_ENDPOINTS.INVENTORY.DOWNLOAD(id)}`,
};