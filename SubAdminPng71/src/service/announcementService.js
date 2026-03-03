// services/announcementService.js
import { apiService } from './api';

export const announcementService = {
  // Get all announcements
  getAllAnnouncements: async (params = {}) => {
    return await apiService.get('/adminannouncement', params);
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    return await apiService.get(`/adminannouncement/${id}`);
  },

  // Create announcement
  createAnnouncement: async (announcementData) => {
    return await apiService.post('/adminannouncement', announcementData);
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    return await apiService.put(`/adminannouncement/${id}`, announcementData);
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    return await apiService.delete(`/adminannouncement/${id}`);
  },

  // Get active announcements
  getActiveAnnouncements: async () => {
    return await apiService.get('/adminannouncement/active');
  },

  // Publish announcement
  publishAnnouncement: async (id) => {
    return await apiService.put(`/adminannouncement/${id}/publish`);
  },

  // Unpublish announcement
  unpublishAnnouncement: async (id) => {
    return await apiService.put(`/adminannouncement/${id}/unpublish`);
  }
};

export default announcementService;
