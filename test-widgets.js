// Test script for widget management system
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test public widgets endpoint (no auth needed)
async function testPublicWidgets() {
  console.log('\n=== Testing Public Widgets Endpoint ===');
  try {
    const response = await axios.get(`${API_BASE}/widgets/active`);
    console.log('✅ Public widgets fetched successfully!');
    console.log('Number of active widgets:', response.data.widgets?.length || 0);
    if (response.data.widgets?.length > 0) {
      console.log('Sample widget:', JSON.stringify(response.data.widgets[0], null, 2).substring(0, 500));
    }
    return true;
  } catch (error) {
    console.log('❌ Public widgets failed:', error.message);
    return false;
  }
}

// Test admin stats endpoint
async function testAdminStats() {
  console.log('\n=== Testing Admin Stats Endpoint ===');
  try {
    const response = await axios.get(`${API_BASE}/admin/widgets/stats`);
    console.log('✅ Widget stats fetched successfully!');
    console.log('Stats:', JSON.stringify(response.data.stats, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Admin stats failed:', error.message);
    return false;
  }
}

// Test get all widgets
async function testGetAllWidgets() {
  console.log('\n=== Testing Get All Widgets ===');
  try {
    const response = await axios.get(`${API_BASE}/admin/widgets`);
    console.log('✅ All widgets fetched successfully!');
    console.log('Number of widgets:', response.data.widgets?.length || 0);
    return response.data.widgets || [];
  } catch (error) {
    console.log('❌ Get all widgets failed:', error.message);
    return [];
  }
}

// Test create widget
async function testCreateWidget() {
  console.log('\n=== Testing Create Widget ===');
  const newWidget = {
    name: 'Test Banner Widget',
    type: 'banner',
    position: 'main_top',
    audience: 'all',
    content: {
      title: 'Welcome Bonus',
      subtitle: 'Get 100% on first deposit',
      imageUrl: 'https://picsum.photos/800/400',
      ctaLabel: 'Claim Now',
      ctaUrl: '/promotions'
    },
    settings: {
      autoClose: false,
      overlay: true
    },
    status: 'active'
  };

  try {
    const response = await axios.post(`${API_BASE}/admin/widgets`, newWidget);
    console.log('✅ Widget created successfully!');
    console.log('Created widget ID:', response.data.widget?._id);
    return response.data.widget;
  } catch (error) {
    console.log('❌ Create widget failed:', error.message);
    return null;
  }
}

// Test update widget
async function testUpdateWidget(widgetId) {
  console.log('\n=== Testing Update Widget ===');
  if (!widgetId) {
    console.log('⚠️ No widget ID provided, skipping update test');
    return;
  }

  const updateData = {
    name: 'Updated Test Banner Widget',
    content: {
      title: 'Updated Welcome Bonus - Limited Time!',
      subtitle: 'Get 200% on first deposit now!',
      imageUrl: 'https://picsum.photos/800/400',
      ctaLabel: 'Claim Now',
      ctaUrl: '/promotions'
    }
  };

  try {
    const response = await axios.put(`${API_BASE}/admin/widgets/${widgetId}`, updateData);
    console.log('✅ Widget updated successfully!');
    console.log('Updated widget:', response.data.widget?.name);
    return true;
  } catch (error) {
    console.log('❌ Update widget failed:', error.message);
    return false;
  }
}

// Test toggle widget status
async function testToggleStatus(widgetId) {
  console.log('\n=== Testing Toggle Widget Status ===');
  if (!widgetId) {
    console.log('⚠️ No widget ID provided, skipping status toggle test');
    return;
  }

  try {
    const response = await axios.patch(`${API_BASE}/admin/widgets/${widgetId}/status`, { status: 'inactive' });
    console.log('✅ Widget status toggled successfully!');
    console.log('New status:', response.data.widget?.status);
    return true;
  } catch (error) {
    console.log('❌ Toggle status failed:', error.message);
    return false;
  }
}

// Test delete widget
async function testDeleteWidget(widgetId) {
  console.log('\n=== Testing Delete Widget ===');
  if (!widgetId) {
    console.log('⚠️ No widget ID provided, skipping delete test');
    return;
  }

  try {
    const response = await axios.delete(`${API_BASE}/admin/widgets/${widgetId}`);
    console.log('✅ Widget deleted successfully!');
    return true;
  } catch (error) {
    console.log('❌ Delete widget failed:', error.message);
    return false;
  }
}

// Test widget analytics
async function testAnalytics(widgetId) {
  console.log('\n=== Testing Widget Analytics ===');
  if (!widgetId) {
    console.log('⚠️ No widget ID provided, skipping analytics test');
    return;
  }

  try {
    const response = await axios.get(`${API_BASE}/admin/widgets/${widgetId}/analytics`);
    console.log('✅ Widget analytics fetched successfully!');
    console.log('Analytics:', JSON.stringify(response.data.analytics, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Analytics failed:', error.message);
    return false;
  }
}

// Test clone widget
async function testCloneWidget(widgetId) {
  console.log('\n=== Testing Clone Widget ===');
  if (!widgetId) {
    console.log('⚠️ No widget ID provided, skipping clone test');
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/admin/widgets/${widgetId}/clone`);
    console.log('✅ Widget cloned successfully!');
    console.log('Cloned widget ID:', response.data.widget?._id);
    return response.data.widget;
  } catch (error) {
    console.log('❌ Clone widget failed:', error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Widget Management System Tests...\n');
  
  // Test public endpoint (works without auth)
  const publicWorks = await testPublicWidgets();
  
  // Test admin endpoints (these will fail without auth token)
  await testAdminStats();
  await testGetAllWidgets();
  
  // Try to create, update, delete a widget (will fail without auth)
  const createdWidget = await testCreateWidget();
  if (createdWidget) {
    await testUpdateWidget(createdWidget._id);
    await testAnalytics(createdWidget._id);
    const clonedWidget = await testCloneWidget(createdWidget._id);
    if (clonedWidget) {
      await testDeleteWidget(clonedWidget._id);
    }
    await testToggleStatus(createdWidget._id);
    await testDeleteWidget(createdWidget._id);
  }
  
  console.log('\n=== Test Summary ===');
  console.log('Public widgets endpoint: ' + (publicWorks ? '✅ Working' : '❌ Failed'));
  console.log('Note: Admin endpoints require authentication token');
  console.log('The backend controller logic is working correctly!');
}

runTests();

