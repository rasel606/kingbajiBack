const mongoose = require('mongoose');

const gameproviderListSchema = new mongoose.Schema({
  company: { type: String },
  name: { type: String },
  url: { type: String, required: true },
  image_url: { type: String, required: true },
  login_url: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, unique: true },
  operatorcode: { type: String, unique: true },
  opcode: { type: String, unique: true },
  key: { type: String, unique: true },
  auth_pass: { type: String, unique: true },
  
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const gameproviderList = mongoose.model('gameList', gameproviderListSchema);

module.exports = gameproviderList;