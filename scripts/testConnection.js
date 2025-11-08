require('dotenv').config({ path: '.env' });

console.log('🔍 Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');

// Check if .env file exists
const fs = require('fs');
if (fs.existsSync('.env')) {
  console.log('📁 .env file: ✅ Found');
} else {
  console.log('📁 .env file: ❌ Missing');
}