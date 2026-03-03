// services/vipService.js
import { apiService } from './api';

export const vipService = {
  // Get all VIP users
  getAllVipUsers: async (params = {}) => {
    return await apiService.get('/user/vip', params);
  },

  // Get VIP user by ID
  getVipUserById: async (userId) => {
    return await apiService.get(`/user/vip/${userId}`);
  },

  // Get VIP tiers
  getVipTiers: async () => {
    return await apiService.get('/user/vip/tiers');
  },

  // Update VIP tier
  updateVipTier: async (userId, tierData) => {
    return await apiService.put(`/user/vip/${userId}/tier`, tierData);
  },

  // Get VIP benefits
  getVipBenefits: async (tier) => {
    return await apiService.get(`/user/vip/benefits/${tier}`);
  },

  // Get VIP statistics
  getVipStats: async () => {
    return await apiService.get('/user/vip/stats');
  },

  // Process VIP rewards
  processVipRewards: async (userId) => {
    return await apiService.post(`/user/vip/${userId}/rewards`);
  },

  // Get VIP history
  getVipHistory: async (userId) => {
    return await apiService.get(`/user/vip/${userId}/history`);
  }
};

export default vipService;
