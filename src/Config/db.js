const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // ✅ Cleaned
    logger.info('✅ MongoDB Connected');
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
