const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../Models/User');
const { refreshBalance } = require('./Refresh_blance');
const gameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const app = express();

app.use(express.json());

// // MongoDB models
// const User = mongoose.model('User', new mongoose.Schema({
//   id: String,
//   balance: Number,
//   last_game_id: String,
//   user_name: String,
//   currency_id: String
// }));

// const Game = mongoose.model('Game', new mongoose.Schema({
//   user_id: String,
//   agent_id: String,
//   game_id: String,
//   currency_id: String,
//   bet_amount: Number,
//   transaction_id: String
// }));

// const Provider = mongoose.model('Provider', new mongoose.Schema({
//   id: String,
//   provider: String,
//   opcode: String,
//   key: String,
//   auth_pass: String
// }));

// const fetchApi = async (path, fields) => {
//   // Simulate API call with fetch or axios
//   return { errCode: 0, balance: 100 }; // Example response
// };



  // Constructing the signature
  function generateSignature(...args) {
    console.log("args:", args);
    return crypto.createHash("md5").update(args.join("")).digest("hex").toUpperCase();
  }

