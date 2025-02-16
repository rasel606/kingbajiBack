const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OddsCategoryTableSchema = new Schema({
  sports_key: {
    type: String,
    
  },
  groups: {
    type: [String], // assuming groups can have multiple values
    
  },
  title: {
    type: String,
    
  },
  description: {
    type: String,
    
  },
  is_active: {
    type: Boolean,
    default: true
  },
  has_outrights: {
    type: Boolean,
    default: false
  },
  bet: {
    type: Schema.Types.Mixed, // you can change this depending on the structure of the bet data
    required: true
  },
  staff_id: {
    type: Schema.Types.ObjectId,
    ref: 'Staff', // Assuming you have a Staff model
    required: true
  },
  datetime: {
    type: Date,
    required: true
  }
});

const OddsCategoryTable = mongoose.model('OddsCategoryTable', OddsCategoryTableSchema);

module.exports = OddsCategoryTable;
