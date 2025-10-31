const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  userId: { 
    type: String, 
    required: true, 
    ref: 'User' 
  },
  content: { 
    type: String, 
     
  },
  type: {
    type: String,
    enum: ['approved', 'rejected', 'processed', 'request' , 'withdrawal_processed', 'withdrawal_rejected', 'withdrawal_accepted' , 'withdrawal_request', 'balance_added', 'general'],
    required: true
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  metaData: {
    amount: Number,
    transactionId: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  timeZone: {
    type: String,
    default: 'GMT+6'
  }
});

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;