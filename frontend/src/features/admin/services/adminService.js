import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const adminService = {
  // POST /inventories — multipart/form-data
  createInventory: (formData) =>
    apiClient.post(API_ENDPOINTS.INVENTORY.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // GET /inventories/next-card-number — { nextCardNumber: number }
  getNextCardNumber: () =>
    apiClient.get(`${API_ENDPOINTS.INVENTORY.BASE}/next-card-number`),
};