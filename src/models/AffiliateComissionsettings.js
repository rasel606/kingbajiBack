const AffiliateComissionsettingsSchema = new mongoose.Schema({
  commissionRate: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['affiliate', 'player'],
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled'],
    default: 'active'
  },
  description: String,
  period: Date 
}, { timestamps: true });
module.exports = mongoose.model('AffiliateComissionsettings', AffiliateComissionsettingsSchema);