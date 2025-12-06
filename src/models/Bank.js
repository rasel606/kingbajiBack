const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  affiliate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  bankName: {
    type: String,
    required: [true, 'Please enter bank name']
  },
  bankBranch: {
    type: String,
    required: [true, 'Please enter branch']
  },
  bankHolder: {
    type: String,
    required: [true, 'Please enter account holder name']
  },
  bankCardNo: {
    type: String,
    required: [true, 'Please enter account number']
  },
  swiftCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bank', bankSchema);