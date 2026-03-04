// services/api.js
// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
const LOG_API_CALLS = import.meta.env.VITE_LOG_API_CALLS === 'true';

class ApiService {
  constructor() {
    this.token = null;
    this.baseURL = API_BASE_URL;
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    // Add timeout functionality
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    config.signal = controller.signal;

    try {
      if (LOG_API_CALLS) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`, options.body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'API Error';
        let errorData = null;
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        if (LOG_API_CALLS) {
          console.error('❌ API Error:', errorMessage, errorData);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (LOG_API_CALLS) {
        console.log(`✅ API Response: ${endpoint}`, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }


  // get(endpoint) {
  //   return this.request(endpoint, { method: 'GET' });
  // }


  get(endpoint, params) {
    let url = endpoint;
    if (params && typeof params === "object") {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file with FormData
  upload(endpoint, formData) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }
}

export const apiService = new ApiService();
export default apiService;