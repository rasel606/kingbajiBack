/**
 * API Utilities - Common functions for API operations
 * Provides interceptors, error handling, and request/response utilities
 */

// ========== REQUEST INTERCEPTORS ==========

/**
 * Add request interceptor configurations
 * Currently handled in api.js via fetch headers
 */
export const requestInterceptor = {
  // Add auth token to all requests
  addAuthToken: (headers, token) => {
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Add CORS headers
  addCorsHeaders: (headers) => {
    headers['Access-Control-Allow-Credentials'] = 'true';
    return headers;
  },

  // Add request ID for tracking
  addRequestId: (headers) => {
    headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return headers;
  },
};

// ========== RESPONSE INTERCEPTORS ==========

/**
 * Handle response errors globally
 */
export const responseInterceptor = {
  handleError: (error) => {
    // Handle specific status codes
    switch (error.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('admin_token');
        localStorage.removeItem('agent_token');
        localStorage.removeItem('admin_sub_token');
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden
        console.error('Access forbidden');
        break;
      case 404:
        // Not found
        console.error('Resource not found');
        break;
      case 500:
        // Server error
        console.error('Server error');
        break;
      default:
        console.error('API Error:', error.message);
    }
    throw error;
  },

  // Check if response is valid
  isValidResponse: (response) => {
    return response && response.status !== 'error';
  },
};

// ========== RETRY LOGIC ==========

/**
 * Retry failed API calls with exponential backoff
 */
export const retryCall = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
};

// ========== DATA FORMATTING ==========

/**
 * Format data for API requests
 */
export const dataFormatter = {
  // Convert form data to JSON
  formToJSON: (formData) => {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  },

  // Format query parameters
  formatQueryParams: (params) => {
    return new URLSearchParams(params).toString();
  },

  // Format dates for API
  formatDate: (date) => {
    return new Date(date).toISOString().split('T')[0];
  },

  // Format currency
  formatCurrency: (amount) => {
    return Number(amount).toFixed(2);
  },
};

// ========== VALIDATION ==========

/**
 * Validate API responses
 */
export const validator = {
  // Check if response has required fields
  hasRequiredFields: (data, fields) => {
    return fields.every(field => field in data);
  },

  // Validate email
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate phone
  isValidPhone: (phone) => {
    return /^[0-9\-\+\(\)\s]+$/.test(phone);
  },

  // Validate URL
  isValidURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

// ========== CACHING ==========

/**
 * Simple cache for API responses
 */
class ResponseCache {
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  remove(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new ResponseCache();

// ========== LOGGING ==========

/**
 * Log API calls for debugging
 */
export const logger = {
  logRequest: (method, endpoint, data) => {
    if (import.meta.env.VITE_LOG_API_CALLS === 'true') {
      console.log(`[API] ${method} ${endpoint}`, data);
    }
  },

  logResponse: (method, endpoint, response) => {
    if (import.meta.env.VITE_LOG_API_CALLS === 'true') {
      console.log(`[API Response] ${method} ${endpoint}`, response);
    }
  },

  logError: (method, endpoint, error) => {
    console.error(`[API Error] ${method} ${endpoint}`, error);
  },
};

// ========== BATCH REQUESTS ==========

/**
 * Execute multiple API calls in parallel
 */
export const batchRequest = async (requests) => {
  try {
    return await Promise.all(requests);
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
};

/**
 * Execute multiple API calls sequentially
 */
export const sequentialRequest = async (requests) => {
  const results = [];
  for (const request of requests) {
    try {
      results.push(await request);
    } catch (error) {
      console.error('Sequential request failed:', error);
      results.push(null);
    }
  }
  return results;
};

// ========== TOKEN MANAGEMENT ==========

/**
 * Token utilities
 */
export const tokenManager = {
  // Get token from any storage
  getToken: () => {
    return (
      localStorage.getItem('admin_token') ||
      localStorage.getItem('agent_token') ||
      localStorage.getItem('admin_sub_token') ||
      sessionStorage.getItem('token') ||
      null
    );
  },

  // Save token to localStorage
  saveToken: (token, storageKey = 'admin_token') => {
    localStorage.setItem(storageKey, token);
  },

  // Remove token
  removeToken: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('agent_token');
    localStorage.removeItem('admin_sub_token');
    sessionStorage.removeItem('token');
  },

  // Check if token exists and is valid
  isTokenValid: () => {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      // Decode payload (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Decode token
  decodeToken: (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  },
};

// ========== ERROR HANDLING ==========

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle API errors with structure
 */
export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data,
    };
  }

  return {
    message: error.message || 'Unknown error occurred',
    status: null,
    data: null,
  };
};

export default {
  requestInterceptor,
  responseInterceptor,
  retryCall,
  dataFormatter,
  validator,
  apiCache,
  logger,
  batchRequest,
  sequentialRequest,
  tokenManager,
  APIError,
  handleAPIError,
};
