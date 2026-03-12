const Widget = require('../models/Widget');
const WidgetEvent = require('../models/WidgetEvent');
const path = require('path');

// Utility to apply scheduling/status filtering
const buildActiveFilter = () => {
  const now = new Date();
  return {
    status: 'active',
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };
};

const toSlug = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const normalizeScheduleFields = (payload = {}) => {
  const next = { ...payload };
  const startRaw = payload.startDate ?? payload.settings?.startDate;
  const endRaw = payload.endDate ?? payload.settings?.endDate;

  next.startDate = startRaw ? new Date(startRaw) : null;
  next.endDate = endRaw ? new Date(endRaw) : null;

  if (Number.isNaN(next.startDate?.getTime?.())) next.startDate = null;
  if (Number.isNaN(next.endDate?.getTime?.())) next.endDate = null;

  return next;
};

// Get all widgets
exports.getAllWidgets = async (req, res) => {
  try {
    const { status, type, position, audience, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (position) filter.position = position;
    if (audience) filter.audience = audience;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { 'content.title': regex },
        { 'content.message': regex },
      ];
    }
    
    const widgets = await Widget.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      widgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get widget by ID
exports.getWidgetById = async (req, res) => {
  try {
    const widget = await Widget.findById(req.params.id);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    res.json({
      success: true,
      widget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create widget
exports.createWidget = async (req, res) => {
  console.log('Received widget creation request with data:', req.body);
  try {
    const widgetData = {
      ...normalizeScheduleFields(req.body),
      slug: req.body.slug || toSlug(req.body.name || ''),
      createdBy: req.user?.email || req.user?.userId || 'admin'
    };

    // Auto-place new widget to bottom of its position stack
    if (widgetData.position && (widgetData.order === undefined || widgetData.order === null)) {
      const countAtPosition = await Widget.countDocuments({ position: widgetData.position });
      widgetData.order = countAtPosition + 1;
    }
    
    const widget = await Widget.create(widgetData);
    
    res.status(201).json({
      success: true,
      message: 'Widget created successfully',
      widget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update widget
exports.updateWidget = async (req, res) => {
  try {
    const updateData = {
      ...normalizeScheduleFields(req.body),
      slug: req.body.slug || (req.body.name ? toSlug(req.body.name) : undefined),
      updatedBy: req.user?.email || req.user?.userId || 'admin'
    };
    
    const widget = await Widget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Widget updated successfully',
      widget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete widget
exports.deleteWidget = async (req, res) => {
  try {
    const widget = await Widget.findByIdAndDelete(req.params.id);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }
    
    // clean up analytics events but ignore errors (fire and forget)
    WidgetEvent.deleteMany({ widgetId: req.params.id }).catch(() => {});

    res.json({
      success: true,
      message: 'Widget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update widget order
exports.bulkUpdateOrder = async (req, res) => {
  try {
    const { widgets, widgetIds, position } = req.body;
    const normalizedWidgets = Array.isArray(widgets)
      ? widgets
      : Array.isArray(widgetIds)
        ? widgetIds.map((id, index) => ({ id, order: index + 1 }))
        : null;
    
    if (!Array.isArray(normalizedWidgets)) {
      return res.status(400).json({
        success: false,
        message: 'widgets or widgetIds array is required'
      });
    }
    const updates = normalizedWidgets.map((widget) => {
      const widgetId = widget.id || widget._id;
      const safeOrder = Number(widget.order) || 0;
      if (!widgetId) return null;

      const updateQuery = position
        ? { _id: widgetId, position }
        : { _id: widgetId };

      return Widget.findOneAndUpdate(
        updateQuery,
        { order: safeOrder, updatedBy: req.user?.email || req.user?.userId || 'admin' },
        { new: true }
      );
    }).filter(Boolean);
    
    await Promise.all(updates);
    
    res.json({
      success: true,
      message: 'Widget order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const audienceFilterForRequest = (audience) => {
  if (!audience || audience === 'all') return { audience: 'all' };
  return { audience: { $in: ['all', audience] } };
};

// Public: get active widgets (with optional position filter)
exports.getActiveWidgets = async (req, res) => {
  try {
    const filter = buildActiveFilter();
    if (req.query.position) {
      filter.position = req.query.position;
    }
    Object.assign(filter, audienceFilterForRequest(req.query.audience));

    const widgets = await Widget.find(filter).sort({ order: 1, updatedAt: -1 });
    res.json({ success: true, widgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get widget stats
exports.getWidgetStats = async (req, res) => {
  try {
    const totalWidgets = await Widget.countDocuments();
    const activeWidgets = await Widget.countDocuments({ status: 'active' });
    const inactiveWidgets = await Widget.countDocuments({ status: 'inactive' });
    const draftWidgets = await Widget.countDocuments({ status: 'draft' });
    const scheduledActive = await Widget.countDocuments(buildActiveFilter());
    
    const widgetsByType = await Widget.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const widgetsByPosition = await Widget.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalWidgets,
        active: activeWidgets,
        inactive: inactiveWidgets,
        draft: draftWidgets,
        scheduledActive,
        byType: widgetsByType,
        byPosition: widgetsByPosition
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update widget status
exports.updateWidgetStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const widget = await Widget.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user?.email || req.user?.userId || 'admin' },
      { new: true, runValidators: true }
    );

    if (!widget) {
      return res.status(404).json({ success: false, message: 'Widget not found' });
    }

    res.json({ success: true, message: 'Status updated', widget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clone widget
exports.cloneWidget = async (req, res) => {
  try {
    const original = await Widget.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Widget not found' });
    }

    const clone = await Widget.create({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      slug: `${toSlug(original.name)}-copy-${Date.now()}`,
      status: 'inactive',
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: req.user?.email || req.user?.userId || 'admin',
    });

    res.status(201).json({ success: true, message: 'Widget cloned', widget: clone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Public: track widget interaction (noop persistence for now)
exports.trackWidgetInteraction = async (req, res) => {
  try {
    const { widgetId, action, metadata } = req.body;
    if (!widgetId) {
      return res.status(400).json({ success: false, message: 'widgetId is required' });
    }

    const widget = await Widget.findById(widgetId);
    if (!widget) {
      return res.status(404).json({ success: false, message: 'Widget not found' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const userAgent = req.headers['user-agent'];

    await WidgetEvent.create({
      widgetId,
      action: action || 'interaction',
      metadata,
      ip,
      userAgent,
      sessionId: req.sessionID,
      userId: req.user?.id || req.user?._id,
    });

    const inc = { 'metrics.interactions': 1 };
    if (action === 'impression' || action === 'view') inc['metrics.impressions'] = 1;
    if (action === 'click') inc['metrics.clicks'] = 1;

    await Widget.findByIdAndUpdate(widgetId, {
      $inc: inc,
      $set: { 'metrics.lastInteractionAt': new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload asset for widget (image/video thumbnail)
exports.uploadWidgetAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/widgets/${req.file.filename}`;
    res.status(201).json({ success: true, imageUrl: fileUrl, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Basic analytics placeholder
exports.getWidgetAnalytics = async (req, res) => {
  try {
    const widget = await Widget.findById(req.params.id);
    if (!widget) {
      return res.status(404).json({ success: false, message: 'Widget not found' });
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const timeline = await WidgetEvent.aggregate([
      { $match: { widgetId: widget._id, createdAt: { $gte: last7d } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const last24hEvents = await WidgetEvent.aggregate([
      { $match: { widgetId: widget._id, createdAt: { $gte: last24h } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
    ]);

    const timelineByDay = timeline.reduce((acc, cur) => {
      const day = cur._id.day;
      acc[day] = acc[day] || { impression: 0, click: 0, interaction: 0, view: 0, dismiss: 0 };
      acc[day][cur._id.action] = cur.count;
      return acc;
    }, {});

    const last24hSummary = last24hEvents.reduce(
      (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
      {}
    );

    res.json({
      success: true,
      analytics: {
        totals: widget.metrics || { impressions: 0, clicks: 0, interactions: 0 },
        last24h: {
          impressions: last24hSummary.impression || 0,
          clicks: last24hSummary.click || 0,
          interactions: last24hSummary.interaction || 0,
          views: last24hSummary.view || 0,
        },
        timeline: timelineByDay,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
