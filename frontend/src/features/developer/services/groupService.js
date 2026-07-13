import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const groupService = {
  getAll: () => apiClient.get(API_ENDPOINTS.GROUP.BASE),
};