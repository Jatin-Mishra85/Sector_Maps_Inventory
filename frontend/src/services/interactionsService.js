import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const interactionsService = {
  getAllReports: () => apiClient.get(API_ENDPOINTS.INTERACTIONS.REPORTS),
};