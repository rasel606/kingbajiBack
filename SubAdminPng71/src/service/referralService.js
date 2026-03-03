// services/referralService.js
import { apiService } from './api';

export const referralService = {
  // Get referral data
  getReferralData: async (params = {}) => {
    return await apiService.get('/referral', params);
  },

  // Get referred users
  getReferredUsers: async (userId, params = {}) => {
    return await apiService.get(`/referral/users/${userId}`, params);
  },

  // Get referral earnings
  getReferralEarnings: async (userId) => {
    return await apiService.get(`/referral/earnings/${userId}`);
  },

  // Get referral statistics
  getReferralStats: async (userId) => {
    return await apiService.get(`/referral/stats/${userId}`);
  },

  // Process referral bonus
  processReferralBonus: async (userId) => {
    return await apiService.post(`/referral/process-bonus/${userId}`);
  },

  // Get referral code
  getReferralCode: async (userId) => {
    return await apiService.get(`/referral/code/${userId}`);
  },

  // Generate new referral code
  generateReferralCode: async (userId) => {
    return await apiService.post(`/referral/generate-code/${userId}`);
  }
};

export default referralService;
