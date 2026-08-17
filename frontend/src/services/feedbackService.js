import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const feedbackService = {
  submit: (rating, message) => apiClient.post(API_ENDPOINTS.FEEDBACK.BASE, { rating, message }),
  getAll: () => apiClient.get(API_ENDPOINTS.FEEDBACK.BASE),
};