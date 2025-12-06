// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   userId: { 
//     type: String, 
//     required: true, 
//     ref: 'User' 
//   },
//   content: { 
//     type: String, 
     
//   },
//   type: {
//     type: String,

//     required: true
//   },
//   read: { 
//     type: Boolean, 
//     default: false 
//   },
//   metaData: {
//     amount: Number,
//     transactionId: String
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
//   timeZone: {
//     type: String,
//     default: 'GMT+6'
//   }
// });

// // Index for faster queries
// notificationSchema.index({ userId: 1, read: 1 });

// const Notification = mongoose.model("Notification", notificationSchema);
// module.exports = Notification;


// Models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,

    default: 'system'
  },
  metaData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Push notification related fields
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date
  },
  // Web push subscription (for storing user's push subscription)
  subscription: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);