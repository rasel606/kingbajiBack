const mongoose = require('mongoose');

const widgetEventSchema = new mongoose.Schema(
  {
    widgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Widget',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['impression', 'click', 'interaction', 'dismiss', 'view'],
      default: 'interaction',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: String,
    userAgent: String,
    sessionId: String,
    userId: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

widgetEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WidgetEvent', widgetEventSchema);
