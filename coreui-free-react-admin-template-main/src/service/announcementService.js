import { apiService } from './api'

const API_URL = '/adminannouncement'

// Get all announcements (public)
const getAnnouncements = async () => {
  const response = await apiService.get(API_URL)
  return response.data
}

// Get active announcements
const getActiveAnnouncements = async () => {
  const response = await apiService.get(`${API_URL}/announcement/active`)
  return response.data
}

// Get all announcements (admin)
const getAllAnnouncements = async () => {
  const response = await apiService.get(`${API_URL}/announcement/all`)
  console.log('All Announcements:', response.data)
  return response
}

// Get single announcement
const getAnnouncement = async (id) => {
  const response = await apiService.get(`${API_URL}/announcement/${id}`)
  return response.data
}

// Create announcement
const createAnnouncement = async (announcementData) => {
  const response = await apiService.post(`${API_URL}/announcement`, announcementData)
  return response
}

// Update announcement
const updateAnnouncement = async (id, announcementData) => {
  const response = await apiService.put(`${API_URL}/announcement/${id}`, announcementData)
  return response.data
}

// Delete announcement
const deleteAnnouncement = async (id) => {
  const response = await apiService.delete(`${API_URL}/announcement/${id}`)
  return response.data
}

// Toggle announcement status
const toggleAnnouncementStatus = async (id) => {
  const response = await apiService.patch(`${API_URL}/announcement/${id}/toggle`)
  console.log('Toggle Status Response:', response.data)
  return response.data
}

const announcementService = {
  getAnnouncements,
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
}

export default announcementService
