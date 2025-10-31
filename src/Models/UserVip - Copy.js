const mongoose = require('mongoose');

const UserVipSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true
  },
  currentLevel: { 
    type: String, 
    required: true, 
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'], 
    default: 'Bronze'
  },
  vipPoints: { 
    type: Number, 
    default: 0,
    min: 0
  },
  monthlyTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lastMonthTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lifetimeTurnover: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lastLoyaltyBonusDate: Date,
  lastLevelUpdateDate: Date,
  isLevelManual: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
  ,
  lest_transaction_amount: { 
    type: Number, 
    required: true 
  },
  last_transaction_date: { 
    type: Date, 
    required: true 
  }
  ,
  last_transaction_type: { 
    type: String, 
    required: true 
  },
  
});

// Update timestamp before saving
UserVipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserVip', UserVipSchema);