const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  sub_cat_id: {
    type: String, // or Number based on your data
    required: true,
    unique: true
  },
  cat_id: {
    type: String, // or Number based on your data
    required: true
  },
  sub_cat_name: {
    type: String,
    required: true
  },
  json: {
    type: mongoose.Schema.Types.Mixed, // to store a variety of objects
    required: true
  },
  sub2: {
    type: String, // change type if needed
    default: null
  },
  sub3: {
    type: String, // change type if needed
    default: null
  },
  datetime: {
    type: Date,
    default: Date.now
  }
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
