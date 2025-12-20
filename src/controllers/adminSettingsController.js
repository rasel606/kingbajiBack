const SystemSettings = require('../models/SystemSettings');
const AdminActivityLog = require('../models/AdminActivityLog');

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'read')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view settings"
      });
    }

    const settings = await SystemSettings.getSettings();
    
    // Hide sensitive information based on role
    const sanitizedSettings = settings.toObject();
    
    if (req.admin.role !== 'superadmin') {
      // Hide API keys and sensitive info for non-superadmins
      delete sanitizedSettings.smsSettings;
      delete sanitizedSettings.emailSettings;
      delete sanitizedSettings.apiSettings;
      delete sanitizedSettings.securitySettings;
    }

    res.json({
      success: true,
      settings: sanitizedSettings
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings"
    });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update settings"
      });
    }

    const updates = req.body;
    const settings = await SystemSettings.getSettings();

    const beforeUpdate = settings.toObject();

    // Update settings based on role
    const allowedFields = ['siteName', 'siteUrl', 'siteLogo', 'siteFavicon', 'maintenanceMode', 'maintenanceMessage'];

    if (req.admin.role === 'superadmin') {
      // Superadmin can update everything
      Object.keys(updates).forEach(key => {
        if (settings[key] !== undefined) {
          settings[key] = updates[key];
        }
      });
    } else if (req.admin.role === 'admin') {
      // Admin can update most settings except sensitive ones
      allowedFields.push('depositSettings', 'withdrawalSettings', 'referralSettings', 'vipSettings', 'commissionTiers');
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          settings[field] = updates[field];
        }
      });
    } else {
      // Other roles have limited access
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          settings[field] = updates[field];
        }
      });
    }

    settings.updatedBy = req.admin.adminId;
    settings.updatedAt = new Date();

    await settings.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'UPDATE',
      module: 'settings',
      entityId: settings._id,
      entityType: 'SystemSettings',
      changes: { before: beforeUpdate, after: settings.toObject() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });
  }
};

// Update specific setting section
exports.updateSettingSection = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update settings"
      });
    }

    const { section } = req.params;
    const updates = req.body;

    const settings = await SystemSettings.getSettings();

    // Check if section exists
    if (!settings[section]) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings section: ${section}`
      });
    }

    // Role-based access control for sections
    const restrictedSections = ['smsSettings', 'emailSettings', 'apiSettings', 'securitySettings'];
    
    if (restrictedSections.includes(section) && req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can update this section"
      });
    }

    const beforeUpdate = JSON.parse(JSON.stringify(settings[section]));
    
    // Update the section
    settings[section] = { ...settings[section], ...updates };
    settings.updatedBy = req.admin.adminId;
    settings.updatedAt = new Date();

    await settings.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'UPDATE',
      module: 'settings',
      entityId: settings._id,
      entityType: 'SystemSettings',
      changes: { 
        before: { [section]: beforeUpdate },
        after: { [section]: settings[section] }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `${section} updated successfully`,
      [section]: settings[section]
    });
  } catch (error) {
    console.error("Update setting section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings section"
    });
  }
};

// Add deposit method
exports.addDepositMethod = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update deposit methods"
      });
    }

    const { method } = req.body;
    const settings = await SystemSettings.getSettings();

    if (!settings.depositMethods) {
      settings.depositMethods = [];
    }

    // Check if method already exists
    const exists = settings.depositMethods.some(m => m.name === method.name || m.type === method.type);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Deposit method already exists"
      });
    }

    settings.depositMethods.push({
      ...method,
      status: method.status || 'active'
    });

    settings.updatedBy = req.admin.adminId;
    settings.updatedAt = new Date();

    await settings.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'CREATE',
      module: 'settings',
      entityId: settings._id,
      entityType: 'DepositMethod',
      changes: { before: null, after: method },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Deposit method added successfully",
      method
    });
  } catch (error) {
    console.error("Add deposit method error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add deposit method"
    });
  }
};

// Update deposit method
exports.updateDepositMethod = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update deposit methods"
      });
    }

    const { methodId } = req.params;
    const updates = req.body;
    const settings = await SystemSettings.getSettings();

    const methodIndex = settings.depositMethods.findIndex(m => m._id.toString() === methodId);
    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found"
      });
    }

    const beforeUpdate = JSON.parse(JSON.stringify(settings.depositMethods[methodIndex]));
    
    // Update the method
    settings.depositMethods[methodIndex] = {
      ...settings.depositMethods[methodIndex],
      ...updates
    };

    settings.updatedBy = req.admin.adminId;
    settings.updatedAt = new Date();

    await settings.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'UPDATE',
      module: 'settings',
      entityId: methodId,
      entityType: 'DepositMethod',
      changes: { before: beforeUpdate, after: settings.depositMethods[methodIndex] },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Deposit method updated successfully",
      method: settings.depositMethods[methodIndex]
    });
  } catch (error) {
    console.error("Update deposit method error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update deposit method"
    });
  }
};

// Add VIP level
exports.addVipLevel = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('settings', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update VIP settings"
      });
    }

    const { level } = req.body;
    const settings = await SystemSettings.getSettings();

    if (!settings.vipSettings) {
      settings.vipSettings = [];
    }

    // Check if level already exists
    const exists = settings.vipSettings.some(l => l.level === level.level);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "VIP level already exists"
      });
    }

    settings.vipSettings.push(level);
    settings.vipSettings.sort((a, b) => a.minTurnover - b.minTurnover);

    settings.updatedBy = req.admin.adminId;
    settings.updatedAt = new Date();

    await settings.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'CREATE',
      module: 'settings',
      entityId: settings._id,
      entityType: 'VIPLevel',
      changes: { before: null, after: level },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "VIP level added successfully",
      level
    });
  } catch (error) {
    console.error("Add VIP level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add VIP level"
    });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res) => {
  try {
    // Check permissions - only superadmin can view system logs
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can view system logs"
      });
    }

    const { 
      page = 1, 
      limit = 100, 
      type, 
      level, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (type) filter.type = type;
    if (level) filter.level = level;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } }
      ];
    }

    // You'll need to create a SystemLog model for this
    // const logs = await SystemLog.find(filter)
    //   .sort({ timestamp: -1 })
    //   .skip(skip)
    //   .limit(parseInt(limit));

    // const total = await SystemLog.countDocuments(filter);

    // For now, return placeholder
    res.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });
  } catch (error) {
    console.error("Get system logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system logs"
    });
  }
};

// Backup database (initiate backup)
exports.initiateBackup = async (req, res) => {
  try {
    // Check permissions - only superadmin can backup
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can initiate backup"
      });
    }

    const { backupType = 'full' } = req.body;

    // This is a placeholder - implement actual backup logic
    // For MongoDB, you might use mongodump command
    // For SQL databases, use appropriate backup methods

    const backupInfo = {
      type: backupType,
      timestamp: new Date(),
      initiatedBy: req.admin.adminId,
      status: 'pending',
      downloadUrl: null
    };

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'BACKUP',
      module: 'settings',
      entityId: 'database',
      entityType: 'Backup',
      changes: { before: null, after: backupInfo },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Backup initiated successfully",
      backupInfo
    });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate backup"
    });
  }
};

// Clear cache
exports.clearCache = async (req, res) => {
  try {
    // Check permissions - only superadmin can clear cache
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can clear cache"
      });
    }

    const { cacheType = 'all' } = req.body;

    // This is a placeholder - implement actual cache clearing logic
    // Clear Redis cache, memory cache, etc.

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'CLEAR_CACHE',
      module: 'settings',
      entityId: 'cache',
      entityType: 'Cache',
      changes: { before: null, after: { cacheType } },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Cache cleared successfully",
      cacheType
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache"
    });
  }
};