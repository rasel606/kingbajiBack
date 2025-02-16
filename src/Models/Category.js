const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String, // Assuming image is a URL or file path
        
      },
      staff_id: {
        type: Number,  // Assuming staff_id is numeric
        
      },
      gameId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'game' }],
      g_type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'game' }],
      id_active: {
        type: Boolean,
        
        default: true,
      },
      datetime: {
        type: Date,
        required: true,
        default: Date.now,  // You can set default value to current time if required
      },
  updatetimestamp: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;