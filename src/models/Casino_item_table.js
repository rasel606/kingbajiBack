const mongoose = require('mongoose');

const CasinoItemTableSchema = new mongoose.Schema({
  category_id: { type: String, required: true },
  sub2: { type: String, required: true },
  sub_category_item: { type: String, required: true },
  image: { type: String, required: true },
  casinoItem_url: { type: String,   },

  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const CasinoItemTable = mongoose.model('CasinoItemTable', CasinoItemTableSchema);

module.exports = CasinoItemTable;