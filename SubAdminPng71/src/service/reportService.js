// services/reportService.js
import { apiService } from './api';

export const reportService = {
  // User reports
  getUserReport: async (params = {}) => {
    return await apiService.get('/user/rebet', params);
  },

  // Betting reports
  getBettingReport: async (params = {}) => {
    return await apiService.get('/user/betting', params);
  },

  getBettingHistory: async (userId, params = {}) => {
    return await apiService.get(`/user/betting/history/${userId}`, params);
  },

  // Transaction reports
  getTransactionReport: async (params = {}) => {
    return await apiService.get('/transactions/report', params);
  },

  // Dashboard analytics
  getDashboardAnalytics: async (params = {}) => {
    return await apiService.get('/dashboard/analytics', params);
  },

  getAdvancedAnalytics: async (params = {}) => {
    return await apiService.get('/dashboard/analytics/advanced', params);
  },

  // Unified dashboard
  getUnifiedDashboard: async (params = {}) => {
    return await apiService.get('/unified-dashboard', params);
  },

  // Export reports
  exportUserReport: async (params = {}) => {
    return await apiService.get('/user/rebet/export', params);
  },

  exportBettingReport: async (params = {}) => {
    return await apiService.get('/user/betting/export', params);
  },

  exportTransactionReport: async (params = {}) => {
    return await apiService.get('/transactions/export', params);
  },

  // Financial reports
  getFinancialSummary: async (params = {}) => {
    return await apiService.get('/dashboard/financial-summary', params);
  },

  getRevenueReport: async (params = {}) => {
    return await apiService.get('/dashboard/revenue', params);
  }
};

export default reportService;
