const express = require('express');
const mongoose = require('mongoose');

const CasinoCategoryTableSchema = new mongoose.Schema({
  c_id: { type: String },
  icon: { type: String},
  category_name: { type: String},
  link: { type: String},
  is_active: { type: Boolean, default: true },
  game_id: [{type: String}],

  

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const CasinoCategoryTable = mongoose.model('CasinoCategoryTable', CasinoCategoryTableSchema);

module.exports = CasinoCategoryTable;