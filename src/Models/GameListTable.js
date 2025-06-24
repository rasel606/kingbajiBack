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
  h5_fun: { type: String },
  web_fun: { type: String },
  status: { type: String },
  g_code_h5: { type: String },
  g_code_fun_h5: { type: String },
  g_code_web: { type: String },
  g_code_fun_web: { type: String },
  gameName: {
    gameName_enus: String,
    gameName_zhcn: String,
    gameName_zhtw: String
  },
  imgFileName: String,
  gameNameTrial: { type: String, default: null },
  displaydemo: { type: String },
  position: { type: String },
  externalgid: { type: String },
  externalmgid: { type: String },
  brand: { type: String },
  category_name: { type: String,ref: 'Category'},
  serial_number: { type: Number,unique: true},
  new_brand: { type: String },
  new_category_name: { type: String },
  
 
  
  // image_url: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  is_hot: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  isFeatured:{ type: Boolean, default: false },
  updatetimestamp: { type: Date, default: Date.now },
});

const GameListTable = mongoose.model('GameListTable', GameListTableSchema);

module.exports = GameListTable;