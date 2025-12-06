const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  getActiveAnnouncements
} = require('../Controllers/announcementController');
const auth = require('../MiddleWare/AdminAuth');

// Public routes
router.get('/', getAnnouncements);
router.get('/active', getActiveAnnouncements);
router.get('/:id', getAnnouncement);

// Admin routes
router.get('/announcement/all', auth, getAllAnnouncements);
router.post('/announcement', auth, createAnnouncement);
router.put('/announcement/:id', auth, updateAnnouncement);
router.delete('/announcement/:id', auth, deleteAnnouncement);
router.patch('/announcement/:id/toggle', auth, toggleAnnouncementStatus);

module.exports = router;