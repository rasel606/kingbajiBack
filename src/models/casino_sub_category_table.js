const mongoose = require('mongoose');

const bankTableSchema = new mongoose.Schema({
  sub_category_id: { type: String },
  cat_id: { type: String, required: true },
  sub_cat_name: { type: String, required: true },
  sub_2: { type: String, required: true },
  sub_3: { type: String, required: true },
  image: { type: String, required: true },
  casinoItem_url: { type: String,   },

  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const bankTable = mongoose.model('bankTable', bankTableSchema);

module.exports = bankTable;