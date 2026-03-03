const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    
  },
  image: {
    type: String, // Assuming image is a URL or file path

  },
  category_code: {
    type: String,
    
  },

  g_code: [{ type: String}],

  p_code: [{ type: String, }],
  g_type: { type: String },
  id_active: {
    type: Boolean,

    default: true,
  },
  gamelist: [{
    g_code: String,
    p_code: String,
    g_type: String,
  }],
  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;