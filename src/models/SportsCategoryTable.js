const mongoose = require('mongoose');

const SportsCategoryTableSchema = new mongoose.Schema({
      name: {
        type: String,
        
      },
      image: {
        type: String, // Assuming image is a URL or file path
        
      },
      staff_id: {
        type: Number,  // Assuming staff_id is numeric
        
      },
      id_active: {
        type: Boolean,
        
        default: true,
      },
      timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const SportsCategoryTable = mongoose.model('SportsCategoryTable', SportsCategoryTableSchema);

module.exports = SportsCategoryTable;