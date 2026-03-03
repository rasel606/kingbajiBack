const mongoose = require('mongoose');

const GameTypeListSchema = new mongoose.Schema({
  type_name: { type: String},
  type_code: { type: String},
  type_image: { type: String},
  game_is_api: { type: String},
  is_active: { type: Boolean },
  gametype_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const GameTypeList = mongoose.model('GameTypeList', GameTypeListSchema);

module.exports = GameTypeList;