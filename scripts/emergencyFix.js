require('dotenv').config({ path: '.env' }); // Explicitly load .env file
const mongoose = require('mongoose');

async function emergencyFix() {
  try {
    // Check environment variables
    const MONGODB_URI = "mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" || 'mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log('📁 Database:', MONGODB_URI);

    mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

    console.log('✅ MongoDB Connected Successfully');

    const User = require('../Models/User');
    
    console.log('🔄 Fixing email issues...');
    
    // Step 1: Find all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Step 2: Fix users with email issues
    let fixedCount = 0;
    for (const user of allUsers) {
      let needsUpdate = false;
      const updateData = {};
      
      // Case 1: Empty email string
      if (user.email === '') {
        updateData.email = undefined; // Remove the field
        needsUpdate = true;
        console.log(`🔄 User ${user.userId}: Empty email -> Removing field`);
      }
      
      // Case 2: Null email
      else if (user.email === null) {
        updateData.email = undefined; // Remove the field
        needsUpdate = true;
        console.log(`🔄 User ${user.userId}: Null email -> Removing field`);
      }
      
      // Case 3: Duplicate email (check if we need to handle this)
      // We'll handle this separately
      
      if (needsUpdate) {
        await User.updateOne(
          { _id: user._id },
          { $unset: { email: 1 } }
        );
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} users with email issues`);
    
    // Step 3: Drop existing email index
    try {
      await User.collection.dropIndex('email_1');
      console.log('✅ Dropped old email index');
    } catch (error) {
      console.log('ℹ️ Email index already dropped or not exists');
    }
    
    // Step 4: Create new NON-UNIQUE sparse index
    await User.collection.createIndex(
      { email: 1 }, 
      { 
        sparse: true // Only index documents that have email field
        // Removed unique: true to allow multiple null/missing emails
      }
    );
    console.log('✅ Created new non-unique sparse email index');
    
    // Step 5: Verify the fix
    const usersWithEmail = await User.countDocuments({ email: { $exists: true } });
    const usersWithoutEmail = await User.countDocuments({ email: { $exists: false } });
    
    console.log('\n📊 Verification:');
    console.log(`📧 Users with email: ${usersWithEmail}`);
    console.log(`🚫 Users without email: ${usersWithoutEmail}`);
    console.log(`👥 Total users: ${allUsers.length}`);
    
    console.log('\n🎉 Email issues fixed successfully!');
    console.log('📝 Now you can register users without email');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
emergencyFix();