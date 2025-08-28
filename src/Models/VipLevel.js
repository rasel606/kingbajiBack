const mongoose = require('mongoose');

const VipLevelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'],
    index: true
  },
  monthlyTurnoverRequirement: { 
    type: Number, 
    required: true,
    min: 0
  },
  vpConversionRate: { 
    type: Number, 
    required: true,
    min: 1
  },
  vpToMoneyRatio: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  minConversionVP: { 
    type: Number, 
    required: true,
    min: 5000
  },
  loyaltyBonusPercentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  benefits: [{
    type: String,
    trim: true
  }],
  isInvitationOnly: { 
    type: Boolean, 
    default: false 
  },
  iconUrl: { 
    type: String, 
    trim: true 
  },
  levelOrder: { 
    type: Number, 
    required: true,
    unique: true,
    min: 1
  },
  colorCode: { 
    type: String, 
    trim: true,
    default: '#000000'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp before saving
VipLevelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VipLevel', VipLevelSchema);