const mongoose = require('mongoose');

const GamesSchema = new mongoose.Schema({
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  externalgid: String,
  externalmgid: String
});

const Games = mongoose.model('Games', GamesSchema);
module.exports = Games;