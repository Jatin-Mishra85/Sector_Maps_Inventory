import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const inventoryService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.INVENTORY.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.INVENTORY.BY_ID(id)),
  getBySector: (sectorId) =>
    apiClient.get(API_ENDPOINTS.INVENTORY.BY_SECTOR(sectorId)),
  create: (payload) => apiClient.post(API_ENDPOINTS.INVENTORY.BASE, payload),
  update: (id, payload) => apiClient.put(API_ENDPOINTS.INVENTORY.BY_ID(id), payload),
  remove: (id) => apiClient.delete(API_ENDPOINTS.INVENTORY.BY_ID(id)),
};