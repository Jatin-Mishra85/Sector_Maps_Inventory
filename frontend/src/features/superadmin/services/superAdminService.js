import apiClient from '../../../services/apiClient';

export const superAdminService = {
  getAllUsers: () => apiClient.get('/admin/users'),
  toggleAdmin: (userId) => apiClient.patch(`/admin/users/${userId}/toggle-admin`),
  toggleBlock: (userId) => apiClient.patch(`/admin/users/${userId}/toggle-block`),
};