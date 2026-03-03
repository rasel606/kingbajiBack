// utils/testConnection.js
// Utility to test API connection

import authService from '../service/authService';
import { apiService } from '../service/api';

/**
 * Test API connection and authentication
 * @returns {Promise<Object>} Connection test results
 */
export const testAPIConnection = async () => {
  const results = {
    backend: false,
    backendUrl: import.meta.env.VITE_API_BASE_URL,
    socketUrl: import.meta.env.VITE_SOCKET_URL,
    auth: false,
    profile: null,
    error: null,
    timestamp: new Date().toISOString()
  };

  try {
    // Test 1: Check if backend is reachable
    console.log('🧪 Testing backend connection...');
    const response = await fetch(import.meta.env.VITE_API_BASE_URL.replace('/api', '') + '/api/v1/health');
    
    if (response.ok) {
      results.backend = true;
      console.log('✅ Backend is reachable');
    } else {
      results.backend = false;
      results.error = `Backend returned ${response.status}`;
      console.log('⚠️ Backend returned:', response.status);
    }
  } catch (error) {
    results.backend = false;
    results.error = error.message;
    console.error('❌ Backend connection failed:', error.message);
  }

  try {
    // Test 2: Check authentication
    console.log('🧪 Testing authentication...');
    const token = localStorage.getItem('subadmin_token');
    
    if (token) {
      authService.init();
      const profile = await authService.getProfile();
      results.auth = true;
      results.profile = profile;
      console.log('✅ Authentication valid');
    } else {
      results.auth = false;
      results.error = 'No token found';
      console.log('⚠️ No authentication token found');
    }
  } catch (error) {
    results.auth = false;
    if (!results.error) {
      results.error = error.message;
    }
    console.error('❌ Authentication test failed:', error.message);
  }

  return results;
};

/**
 * Test specific API endpoint
 * @param {string} endpoint - API endpoint to test
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Test result
 */
export const testEndpoint = async (endpoint, method = 'GET', data = null) => {
  const result = {
    success: false,
    endpoint,
    method,
    response: null,
    error: null,
    timestamp: new Date().toISOString()
  };

  try {
    console.log(`🧪 Testing ${method} ${endpoint}...`);
    
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiService.get(endpoint);
        break;
      case 'POST':
        response = await apiService.post(endpoint, data);
        break;
      case 'PUT':
        response = await apiService.put(endpoint, data);
        break;
      case 'DELETE':
        response = await apiService.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    result.success = true;
    result.response = response;
    console.log(`✅ ${method} ${endpoint} succeeded`);
  } catch (error) {
    result.success = false;
    result.error = error.message;
    console.error(`❌ ${method} ${endpoint} failed:`, error.message);
  }

  return result;
};

/**
 * Run full diagnostic test
 * @returns {Promise<Object>} Complete diagnostic results
 */
export const runDiagnostics = async () => {
  console.log('🔍 Running API diagnostics...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      socketUrl: import.meta.env.VITE_SOCKET_URL,
      nodeEnv: import.meta.env.VITE_NODE_ENV,
      debug: import.meta.env.VITE_DEBUG,
      logApiCalls: import.meta.env.VITE_LOG_API_CALLS
    },
    connection: null,
    token: {
      exists: !!localStorage.getItem('subadmin_token'),
      value: localStorage.getItem('subadmin_token') ? '***' + localStorage.getItem('subadmin_token').slice(-10) : null
    },
    tests: []
  };

  // Test connection
  diagnostics.connection = await testAPIConnection();

  // Additional tests if authenticated
  if (diagnostics.connection.auth) {
    console.log('🧪 Running authenticated endpoint tests...');
    
    // Test dashboard
    const dashboardTest = await testEndpoint('/subadmin/dashboard/overview');
    diagnostics.tests.push(dashboardTest);
  }

  console.log('✅ Diagnostics complete');
  console.table(diagnostics);

  return diagnostics;
};

/**
 * Print connection status to console
 */
export const printConnectionStatus = () => {
  console.log('═══════════════════════════════════');
  console.log('🔧 API Connection Configuration');
  console.log('═══════════════════════════════════');
  console.log('Backend URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
  console.log('Environment:', import.meta.env.VITE_NODE_ENV);
  console.log('Debug Mode:', import.meta.env.VITE_DEBUG);
  console.log('API Logging:', import.meta.env.VITE_LOG_API_CALLS);
  console.log('Token Present:', !!localStorage.getItem('subadmin_token'));
  console.log('═══════════════════════════════════');
};

export default {
  testAPIConnection,
  testEndpoint,
  runDiagnostics,
  printConnectionStatus
};
