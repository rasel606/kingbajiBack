const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'banner',
      'promotion',
      'announcement',
      'game_spotlight',
      'custom_html',
      'image',
      'video',
      'countdown',
      'social_feed',
      'live_stats',
      'news_ticker',
      'popup',
      'custom',
      'hero_carousel',
      'notice_marquee',
      'category_nav',
      'image_scroller',
      'game_grid',
      'payment_methods',
      'footer_links',
      'floating_banner',
      'toolbar_menu'
    ]
  },
  position: {
    type: String,
    required: true,
    enum: [
      'top_bar',
      'announcement_bar',
      'header',
      'navigation',
      'sidebar_left',
      'sidebar_right',
      'main_top',
      'main_middle',
      'main_bottom',
      'recommendation',
      'games_section',
      'footer_top',
      'footer_bottom',
      'floating',
      'toolbar',
      'member_menu',
      'popup_layer',
      'modal',
      'custom'
    ]
  },
  audience: {
    type: String,
    enum: ['all', 'guest', 'authenticated', 'vip', 'agent'],
    default: 'all',
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  order: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    lastInteractionAt: { type: Date },
  },
  tags: {
    type: [String],
    default: [],
  },
  theme: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, {
  timestamps: true
});

widgetSchema.index({ type: 1, status: 1 });
widgetSchema.index({ position: 1, status: 1 });
widgetSchema.index({ order: 1 });

module.exports = mongoose.model('Widget', widgetSchema);
