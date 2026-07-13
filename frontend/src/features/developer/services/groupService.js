import apiClient from '../../../services/apiClient'; 
import { API_ENDPOINTS } from '../../../constants/apiEndpoints'; 

export const groupService = { 
  // 1. Saare groups fetch karne ke liye (Abhi yeh /groups par hit karega)
  getAll: () => apiClient.get(API_ENDPOINTS.GROUP.BASE), 

  // 2. Inventories ko group mein add karne ke liye (Abhi yeh /groups/add-inventories par hit karega)
  addInventories: (groupName, inventoryIds) => {
    return apiClient.post(API_ENDPOINTS.GROUP.ADD_INVENTORIES, {
      groupName,
      inventoryIds
    });
  },

  // 3. Inventories ko group se hatane ke liye (Abhi yeh /groups/remove-inventories par hit karega)
  removeInventories: (groupName, inventoryIds) => {
    return apiClient.post(API_ENDPOINTS.GROUP.REMOVE_INVENTORIES, {
      groupName,
      inventoryIds
    });
  }
};
