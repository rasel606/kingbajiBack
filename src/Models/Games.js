// const mongoose = require('mongoose');

// const GamesSchema = new mongoose.Schema({
//   g_code: String,
//   g_type: String,
//   p_code: String,
//   p_type: String,
//   h5: String,
//   web: String,
//   status: String,
//   g_progressive: String,
//   gameName: {
//     gameName_enus: String,
//     gameName_zhcn: String,
//     gameName_zhtw: String
//   },
//   imgFileName: String,
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   },
//   externalgid: String,
//   externalmgid: String
// });

// const Games = mongoose.model('Games', GamesSchema);
// module.exports = Games;




// models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameProvider',
    required: true
  },
  category: {
    type: String,
    enum: ['slot', 'live-casino', 'table', 'sports', 'virtual', 'arcade'],
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  // isNew: {
  //   type: Boolean,
  //   default: false
  // },
  rtp: {
    type: Number,
    min: 0,
    max: 100
  },
  volatility: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  minBet: {
    type: Number,
    default: 0.1
  },
  maxBet: {
    type: Number,
    default: 1000
  },
  features: [String],
  technology: {
    type: String,
    enum: ['html5', 'flash', 'mobile']
  },
  launchUrl: {
    type: String,
    required: true
  },
  demoUrl: {
    type: String
  }
}, {
  timestamps: true
});

gameSchema.index({ provider: 1, category: 1 });
gameSchema.index({ isActive: 1, isPopular: 1 });

module.exports = mongoose.model('Game', gameSchema);