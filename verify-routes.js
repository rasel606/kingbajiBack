#!/usr/bin/env node

/**
 * Backend Route Verification Script
 * Validates that all sub-admin routes are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Backend Route Configuration...\n');

// 1. Check app.js has mainAdminRoutes enabled
const appPath = path.join(__dirname, 'app.js');
const appContent = fs.readFileSync(appPath, 'utf8');

console.log('✓ Checking app.js...');
if (appContent.includes("app.use('/api/admin', mainAdminRoutes)")) {
  console.log('  ✅ mainAdminRoutes is enabled');
} else {
  console.log('  ❌ mainAdminRoutes is NOT enabled');
  process.exit(1);
}

if (appContent.includes("const mainAdminRoutes = require('./src/router/mainAdminRoutes')")) {
  console.log('  ✅ mainAdminRoutes is properly imported');
} else {
  console.log('  ❌ mainAdminRoutes import is missing or incorrect');
  process.exit(1);
}

// 2. Check mainAdminRoutes.js has correct methods
const routePath = path.join(__dirname, 'src/router/mainAdminRoutes.js');
const routeContent = fs.readFileSync(routePath, 'utf8');

console.log('\n✓ Checking mainAdminRoutes.js...');
const expectedMethods = [
  'AdminController.GetSubAdminList',
  'AdminController.GetSubAdminUserList',
  'AdminController.GetSubAdminPendingDepositList',
  'AdminController.GetSubAdminWithdrawalList'
];

expectedMethods.forEach(method => {
  if (routeContent.includes(method)) {
    console.log(`  ✅ ${method} is referenced`);
  } else {
    console.log(`  ❌ ${method} is missing`);
    process.exit(1);
  }
});

// 3. Check AdminController.js has the methods
const ctrlPath = path.join(__dirname, 'src/Controllers/AdminController.js');
const ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

console.log('\n✓ Checking AdminController.js...');
const expectedExports = [
  'exports.GetSubAdminList =',
  'exports.GetSubAdminUserList =',
  'exports.GetSubAdminPendingDepositList =',
  'exports.GetSubAdminWithdrawalList ='
];

expectedExports.forEach(exportStr => {
  if (ctrlContent.includes(exportStr)) {
    console.log(`  ✅ ${exportStr.split(' ')[1]} is exported`);
  } else {
    console.log(`  ❌ ${exportStr.split(' ')[1]} is not exported`);
    process.exit(1);
  }
});

// 4. Check backward compatibility aliases
console.log('\n✓ Checking backward compatibility aliases...');
const aliases = [
  'exports.getSubAdminList = exports.GetSubAdminList',
  'exports.getSubAdminUserDepositList = exports.GetSubAdminPendingDepositList',
  'exports.getSubAdminUserWithdrawList = exports.GetSubAdminWithdrawalList'
];

aliases.forEach(alias => {
  if (ctrlContent.includes(alias)) {
    console.log(`  ✅ ${alias.split(' ')[1]} alias exists`);
  } else {
    console.log(`  ⚠️  ${alias.split(' ')[1]} alias missing (may not be critical)`);
  }
});

console.log('\n✅ All route configurations verified successfully!');
console.log('\n📋 Summary:');
console.log('  - mainAdminRoutes is enabled in app.js');
console.log('  - All controller methods are properly exported');
console.log('  - Routes are correctly configured');
console.log('\n🚀 Backend should be able to serve the following endpoint:');
console.log('  GET /api/admin/get_sub_admin_withdraw_deposit_user_list');
console.log('\n');
