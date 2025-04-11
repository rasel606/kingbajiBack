const mongoose = require('mongoose');
const BettingTableSchema = new mongoose.Schema({
    rel_id: { type: String, required: true },
    rel_type: { type: String, required: true },
    staff_id: { type: String, required: true },
    cetegory_id: { type: String, required: true },
    json: { type: String},

    is_active: { type: Boolean, default: true },
    history: { type: Number },
    manual: { type: Number, default: 0 },
    
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const BettingTable = mongoose.model('BettingTable', BettingTableSchema);

module.exports = BettingTable; 
