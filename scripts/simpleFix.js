// Simple database fix script
require('dotenv').config({ path: '.env' });

console.log('🚀 Starting database fix...');

// Check if we can load environment variables
console.log('🔍 Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');

if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI is missing. Please check your .env file');
  process.exit(1);
}

const mongoose = require('mongoose');

async function fixDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

    console.log('✅ MongoDB Connected');

    // Try to get User model - different possible paths
    let User;
    try {
      User = require('../models/User');
    } catch (error) {
      try {
        User = require('../Models/User');
      } catch (error2) {
        console.log('❌ Cannot find User model. Please check the path.');
        console.log('Current directory:', __dirname);
        process.exit(1);
      }
    }

    console.log('✅ User model loaded successfully');
    
    // Fix 1: Remove email field from all users
    console.log('🔄 Removing email field from all users...');
    const result = await User.updateMany(
      {},
      { $unset: { email: 1 } }
    );
    console.log(`✅ Removed email field from ${result.modifiedCount} users`);

    // Fix 2: Drop email index if exists
    try {
      await User.collection.dropIndex('email_1');
      console.log('✅ Dropped email index');
    } catch (error) {
      console.log('ℹ️ Email index already dropped or not exists');
    }

    console.log('🎉 Database fix completed!');
    console.log('📝 Now users can register without email');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixDatabase();