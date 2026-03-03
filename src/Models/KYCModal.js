const mongoose = require('mongoose');


const kycModalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['identity', 'address'],
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentNo: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: false
  },
  frontImage: {
    url: String,
    deleteUrl: String
  },
  backImage: {
    url: String,
    deleteUrl: String
  },
  otherImage: {
    url: String,
    deleteUrl: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'failed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Compound index to ensure one KYC type per user
kycModalSchema.index({ userId: 1, type: 1 }, { unique: true });


module.exports = mongoose.model('kycModal', kycModalSchema);