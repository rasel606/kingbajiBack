const Announcement = require('../models/Announcement');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public/Private
const getAnnouncements = asyncHandler(async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all announcements (admin)
// @route   GET /api/announcements/admin/all
// @access  Private/Admin
const getAllAnnouncements = asyncHandler(async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public/Private
const getAnnouncement = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  try {
    const {
      content,
      color,
      fontSize,
      icon,
      isActive,
      priority,
      targetUsers,
      startDate,
      endDate
    } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const announcement = new Announcement({
      content: content.trim(),
      color: color || '#e74c3c',
      fontSize: fontSize || '16px',
      icon: icon || 'https://img.s628b.com/sb/h5/assets/images/icon-set/index-theme-icon/index-announcement-icon.svg?v=1760412521693',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 1,
      targetUsers: targetUsers || 'all',
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      createdBy: req.user?.id || 'admin'
    });

    const createdAnnouncement = await announcement.save();
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: createdAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create announcement'
    });
  }
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const {
      content,
      color,
      fontSize,
      icon,
      isActive,
      priority,
      targetUsers,
      startDate,
      endDate
    } = req.body;

    // Update fields
    if (content !== undefined) announcement.content = content.trim();
    if (color !== undefined) announcement.color = color;
    if (fontSize !== undefined) announcement.fontSize = fontSize;
    if (icon !== undefined) announcement.icon = icon;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (priority !== undefined) announcement.priority = priority;
    if (targetUsers !== undefined) announcement.targetUsers = targetUsers;
    if (startDate !== undefined) announcement.startDate = startDate;
    if (endDate !== undefined) announcement.endDate = endDate;
    
    announcement.updatedAt = Date.now();

    const updatedAnnouncement = await announcement.save();
    
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update announcement'
    });
  }
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();
    
    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete announcement'
    });
  }
});

// @desc    Toggle announcement status
// @route   PATCH /api/announcements/:id/toggle
// @access  Private/Admin
const toggleAnnouncementStatus = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isActive = !announcement.isActive;
    announcement.updatedAt = Date.now();

    const updatedAnnouncement = await announcement.save();
    
    res.json({
      success: true,
      message: `Announcement ${updatedAnnouncement.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle announcement status'
    });
  }
});

// @desc    Get active announcements for user
// @route   GET /api/announcements/active
// @access  Public
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const userType = req.user?.role || 'user';
    
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { targetUsers: 'all' },
        { targetUsers: userType }
      ],
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(10);
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  getActiveAnnouncements
};