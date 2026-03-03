// Direct MongoDB connection without mongoose
require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

console.log('🚀 Starting direct MongoDB fix...');

const MONGODB_URI = "mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI is missing');
  process.exit(1);
}

async function directFix() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB directly...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const database = client.db();
    const users = database.collection('users');

    // Get total users count
    const totalUsers = await users.countDocuments();
    console.log(`📊 Total users: ${totalUsers}`);

    // Fix 1: Remove email field from all users
    console.log('🔄 Removing email field...');
    const updateResult = await users.updateMany(
      {},
      { $unset: { email: "" } }
    );
    console.log(`✅ Removed email field from ${updateResult.modifiedCount} users`);

    // Fix 2: Drop email index
    try {
      await users.dropIndex('email_1');
      console.log('✅ Dropped email index');
    } catch (error) {
      console.log('ℹ️ Email index already dropped:', error.message);
    }

    // Fix 3: Create simple sparse index (not unique)
    await users.createIndex(
      { email: 1 },
      { sparse: true, name: 'email_sparse' }
    );
    console.log('✅ Created sparse email index');

    // Verify the fix
    const usersWithEmail = await users.countDocuments({ email: { $exists: true } });
    const usersWithoutEmail = await users.countDocuments({ email: { $exists: false } });
    
    console.log('\n📊 Verification:');
    console.log(`📧 Users with email: ${usersWithEmail}`);
    console.log(`🚫 Users without email: ${usersWithoutEmail}`);
    console.log(`👥 Total users: ${totalUsers}`);

    console.log('\n🎉 Direct fix completed successfully!');

  } catch (error) {
    console.error('❌ Direct fix failed:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

directFix();