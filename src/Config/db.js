// const mongoose = require('mongoose');
// const logger = require('../utils/logger');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // ✅ Cleaned
    
//     console.log('✅ MongoDB Connected');
//     logger.info('✅ MongoDB Connected');
//   } catch (err) {
//     logger.error('❌ MongoDB connection failed:', err.message);
//     logger.error('❌ MongoDB connection failed:', err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/bajicrick247?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('✅ MongoDB Connected Successfully');
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;