exports.transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['recharge', 'deduction'], required: true },
    timestamp: { type: Date, default: Date.now },
    IsActive: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
  });
  