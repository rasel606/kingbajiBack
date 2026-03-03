// src/services/profileService.js
import { apiService } from './api';

export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiService.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiService.put('/profile', profileData);
    return response.data;
  },

  // Request verification code
  requestVerificationCode: async (contactData) => {
    const response = await apiService.post('/profile/verify/request', contactData);
    return response.data;
  },

  // Verify contact
  verifyContact: async (verificationData) => {
    const response = await apiService.post('/profile/verify', verificationData);
    return response.data;
  }
};