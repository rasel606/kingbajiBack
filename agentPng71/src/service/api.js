// services/api.js
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

const buildUrl = (endpoint = '') => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Prevent /api/api/* duplicates when callers pass endpoints like "/api/socket/health"
  if (API_BASE_URL.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedEndpoint.slice(4)}`;
  }

  return `${API_BASE_URL}${normalizedEndpoint}`;
};

class ApiService {
  constructor() {
    this.token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('agent_token') ||
      localStorage.getItem('admin_sub_token') ||
      null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = buildUrl(endpoint);
    const { headers: customHeaders = {}, body, ...restOptions } = options;
    const headers = {
      ...customHeaders,
    };

    if (!(body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...restOptions,
      headers,
    };

    if (body !== undefined) {
      config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';

    let responseData = null;
    if (response.status !== 204) {
      responseData = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
    }

    if (!response.ok) {
      let errorMessage = 'API Error';
      if (responseData && typeof responseData === 'object') {
        errorMessage = responseData.message || responseData.error || errorMessage;
      } else if (typeof responseData === 'string' && responseData.trim()) {
        errorMessage = responseData;
      }
      throw new Error(errorMessage);
    }

    return responseData;
  }

  // get(endpoint) {
  //   return this.request(endpoint, { method: 'GET' });
  // }

  get(endpoint, paramsOrOptions = null) {
    let queryParams = null;
    let requestOptions = {};

    if (paramsOrOptions && typeof paramsOrOptions === 'object' && 'params' in paramsOrOptions) {
      queryParams = paramsOrOptions.params;
      const { params, ...rest } = paramsOrOptions;
      requestOptions = rest;
    } else {
      queryParams = paramsOrOptions;
    }

    let url = endpoint;
    if (queryParams && typeof queryParams === 'object') {
      const queryString = new URLSearchParams(queryParams).toString();
      if (queryString) {
        url += endpoint.includes('?') ? `&${queryString}` : `?${queryString}`;
      }
    }

    return this.request(url, { method: 'GET', ...requestOptions });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  uploadFile(endpoint, formData, onProgress = null) {
    if (!(formData instanceof FormData)) {
      throw new Error('formData must be an instance of FormData');
    }

    const url = buildUrl(endpoint);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = onProgress;
      }

      xhr.onload = () => {
        const responseText = xhr.responseText || '';
        let parsed = null;

        try {
          parsed = responseText ? JSON.parse(responseText) : null;
        } catch {
          parsed = responseText;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parsed);
          return;
        }

        const errorMessage =
          (parsed && typeof parsed === 'object' && (parsed.message || parsed.error)) ||
          `Upload failed with status ${xhr.status}`;
        reject(new Error(errorMessage));
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.send(formData);
    });
  }
}

export const apiService = new ApiService();
export default apiService;