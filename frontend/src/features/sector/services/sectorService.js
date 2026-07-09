import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const sectorService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.SECTOR.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.SECTOR.BY_ID(id)),
  getByDeveloper: (developerId) =>
    apiClient.get(API_ENDPOINTS.SECTOR.BY_DEVELOPER(developerId)),
  create: (payload) => apiClient.post(API_ENDPOINTS.SECTOR.BASE, payload),
  update: (id, payload) => apiClient.put(API_ENDPOINTS.SECTOR.BY_ID(id), payload),
  remove: (id) => apiClient.delete(API_ENDPOINTS.SECTOR.BY_ID(id)),
};