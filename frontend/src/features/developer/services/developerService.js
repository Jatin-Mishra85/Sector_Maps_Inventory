import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const developerService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.DEVELOPER.BASE, { params }),
  getAllWithCounts: () =>
    apiClient.get(API_ENDPOINTS.DEVELOPER.BASE, { params: { withCounts: true } }),
  getById: (id) => apiClient.get(API_ENDPOINTS.DEVELOPER.BY_ID(id)),
  create: (payload) => apiClient.post(API_ENDPOINTS.DEVELOPER.BASE, payload),
  update: (id, payload) => apiClient.put(API_ENDPOINTS.DEVELOPER.BY_ID(id), payload),
  remove: (id) => apiClient.delete(API_ENDPOINTS.DEVELOPER.BY_ID(id)),
};