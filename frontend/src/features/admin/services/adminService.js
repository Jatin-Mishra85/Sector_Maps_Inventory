import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const adminService = {
  // POST /api/inventories — multipart/form-data
  createInventory: (formData) =>
    apiClient.post(API_ENDPOINTS.INVENTORY.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};