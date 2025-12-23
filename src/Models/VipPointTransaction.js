const mongoose = require('mongoose');

const VipPointTransactionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    ref: 'User', 
    required: true,
    index: true
  },
  source: { 
    type: String, 
    required: true,
    enum: ['earned', 'conversion', 'bonus', 'adjustment'] 
  },
  type: {
    type: String,
    required: true,
    enum: ['used', 'recived', 'adjustment']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  conversionRate: { 
    type: Number 
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  balanceAfter: { 
    type: Number 
  },
  points: { 
    type: Number 
  },
  relatedTurnover: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TurnOver' 
  }
}, { timestamps: true });

module.exports = mongoose.model('VipPointTransaction', VipPointTransactionSchema);