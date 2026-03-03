require('dotenv').config();
const mongoose = require('mongoose');

console.log('🚀 Starting database emergency fix...');

const MONGODB_URI ="mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function emergencyFix() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Load User model with correct path
    const User = require('../src/Models/User');
    
    console.log('🔄 Fixing database issues...');

    // Fix 1: Remove email field to avoid unique constraints
    const emailFix = await User.updateMany(
      {},
      { $unset: { email: 1 } }
    );
    console.log(`✅ Removed email field from ${emailFix.modifiedCount} users`);

    // Fix 2: Add referral codes for users without them
    const usersWithoutRefCode = await User.find({ 
      referralCode: { $exists: false } 
    });
    
    console.log(`📊 ${usersWithoutRefCode.length} users need referral codes`);
    
    for (const user of usersWithoutRefCode) {
      const refCode = 'USER' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
      await User.updateOne(
        { _id: user._id },
        { $set: { referralCode: refCode } }
      );
      console.log(`✅ Added referral code for ${user.userId}: ${refCode}`);
    }

    console.log('🎉 Database emergency fix completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

emergencyFix();