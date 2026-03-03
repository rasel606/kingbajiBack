// services/api.js
// Configure based on environment (Vite: use import.meta.env.VITE_*)
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim()
const API_FALLBACK_URL = (import.meta.env.VITE_API_FALLBACK_URL || '').trim()
const API_ENABLE_FALLBACK = import.meta.env.VITE_ENABLE_API_FALLBACK === 'true'

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/$/, '')

class ApiService {
  constructor() {
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config = {
      ...options,
      headers,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    const primaryBase = normalizeBaseUrl(API_BASE_URL)
    const fallbackBase = normalizeBaseUrl(API_FALLBACK_URL)
    const method = (options.method || 'GET').toUpperCase()
    const isAuthEndpoint = /\/admin\/auth\/|\/auth\//i.test(endpoint)

    const callApi = async (baseUrl) => {
      const url = `${baseUrl}${endpoint}`
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorMessage = `API Error (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // Ignore JSON parsing errors
        }
        const err = new Error(errorMessage)
        err.status = response.status
        throw err
      }

      return response.json()
    }

    try {
      return await callApi(primaryBase)
    } catch (error) {
      const shouldRetryWithFallback =
        API_ENABLE_FALLBACK &&
        fallbackBase &&
        fallbackBase !== primaryBase &&
        method === 'GET' &&
        !isAuthEndpoint &&
        (!error.status || error.status >= 500)

      if (shouldRetryWithFallback) {
        return callApi(fallbackBase)
      }

      throw error
    }
  }

  // get(endpoint) {
  //   return this.request(endpoint, { method: 'GET' });
  // }

  get(endpoint, params) {
    let url = endpoint
    if (params && typeof params === 'object') {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }
    return this.request(url, { method: 'GET' })
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body })
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()

// Admin-specific endpoints
export function getUserProfile() {
  return apiService.get('/affiliate/Auth/me')
}

export function getReports() {
  // Placeholder: update with actual reports endpoint
  return apiService.get('/reports')
}

export function getLogs() {
  // Placeholder: update with actual logs endpoint
  return apiService.get('/logs')
}

export function getRoles() {
  // Placeholder: update with actual roles endpoint
  return apiService.get('/roles')
}
