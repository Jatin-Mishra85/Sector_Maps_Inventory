import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const groupService = {
  getAll: () => apiClient.get(API_ENDPOINTS.GROUP.BASE),
  addInventories: (groupName, inventoryIds) =>
    apiClient.post(API_ENDPOINTS.GROUP.ADD_INVENTORIES, { groupName, inventoryIds }),
  removeInventories: (groupName, inventoryIds) =>
    apiClient.post(API_ENDPOINTS.GROUP.REMOVE_INVENTORIES, { groupName, inventoryIds }),
};