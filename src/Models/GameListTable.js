const mongoose = require('mongoose');

const GameListTableSchema = new mongoose.Schema({
  g_code: String,
  g_type: String,
  p_code: String,
  p_type: String,
  h5: String,
  web: String,
  status: String,
  g_progressive: String,
  gameName: {
    gameName_enus: String,
    gameName_zhcn: String,
    gameName_zhtw: String
  },
  imgFileName: String,
  category_name: { type: String,ref: 'Category'},
  serial_number: { type: Number,unique: true},
 
  
  // image_url: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  is_hot: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const GameListTable = mongoose.model('GameListTable', GameListTableSchema);

module.exports = GameListTable;