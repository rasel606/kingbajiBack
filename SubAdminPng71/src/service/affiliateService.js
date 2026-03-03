// services/affiliateService.js
import { apiService } from './api';

export const affiliateService = {
  // Authentication
  login: async (credentials) => {
    return await apiService.post('/affiliate/Auth/login', credentials);
  },

  register: async (userData) => {
    return await apiService.post('/subadmin/auth/register_affiliate', userData);
  },

  // Dashboard
  getDashboard: async () => {
    return await apiService.get('/affiliate/dashboard');
  },

  // Profile
  getProfile: async () => {
    return await apiService.get('/affiliate/profile');
  },

  updateProfile: async (profileData) => {
    return await apiService.put('/affiliate/profile', profileData);
  },

  // Earnings
  getEarnings: async (params = {}) => {
    return await apiService.get('/affiliate/earnings', params);
  },

  getEarningsSummary: async () => {
    return await apiService.get('/affiliate/earnings/summary');
  },

  // Links
  getLinks: async () => {
    return await apiService.get('/affiliate/links');
  },

  createLink: async (linkData) => {
    return await apiService.post('/affiliate/links', linkData);
  },

  deleteLink: async (linkId) => {
    return await apiService.delete(`/affiliate/links/${linkId}`);
  },

  // Withdrawals
  requestWithdrawal: async (withdrawalData) => {
    return await apiService.post('/withdrawals', withdrawalData);
  },

  getWithdrawals: async (params = {}) => {
    return await apiService.get('/withdrawals', params);
  },

  // Users referred
  getReferredUsers: async (params = {}) => {
    return await apiService.get('/affiliate/users', params);
  },

  // Management (Admin)
  getAllAffiliates: async (params = {}) => {
    return await apiService.get('/admin/affiliate/management', params);
  },

  updateAffiliateStatus: async (id, status) => {
    return await apiService.put(`/admin/affiliate/management/${id}/status`, { status });
  }
};

export default affiliateService;
