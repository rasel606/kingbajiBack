// const mongoose = require('mongoose');

// const pushSubscriptionSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//     index: true
//   },
//   userType: {
//     type: String,
//     enum: ['admin', 'subadmin', 'agent', 'user', 'affiliate'],
//     required: true
//   },
//   endpoint: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   keys: {
//     p256dh: {
//       type: String,
//       required: true
//     },
//     auth: {
//       type: String,
//       required: true
//     }
//   },
//   userAgent: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastUsed: {
//     type: Date,
//     default: Date.now
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // Compound index for efficient queries
// pushSubscriptionSchema.index({ userId: 1, userType: 1 });

// const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
// module.exports = PushSubscription;


// Models/PushSubscription.js
const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String
  },
  platform: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index
pushSubscriptionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);