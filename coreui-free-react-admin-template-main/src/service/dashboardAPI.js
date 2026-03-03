// Dashboard API Service - Frontend Utility
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class DashboardAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/dashboard/analytics`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add authorization token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.dispatchEvent(new Event('unauthorized'))
        }
        return Promise.reject(error)
      },
    )
  }

  /**
   * Core Metrics
   */
  async getMetrics(params) {
    try {
      const response = await this.client.get('/metrics', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }

  async getTimeSeries(params) {
    try {
      const response = await this.client.get('/time-series', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching time series:', error)
      throw error
    }
  }

  async getRevenueBreakdown(params) {
    try {
      const response = await this.client.get('/revenue-breakdown', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching revenue breakdown:', error)
      throw error
    }
  }

  /**
   * User Analytics
   */
  async getUserStatistics(params) {
    try {
      const response = await this.client.get('/users/statistics', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching user statistics:', error)
      throw error
    }
  }

  async getUsersByCountry(params) {
    try {
      const response = await this.client.get('/users/geographical', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching geographic data:', error)
      throw error
    }
  }

  /**
   * Betting Analytics
   */
  async getBettingStatistics(params) {
    try {
      const response = await this.client.get('/betting/statistics', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching betting statistics:', error)
      throw error
    }
  }

  async getBetsByGame(params) {
    try {
      const response = await this.client.get('/betting/by-game', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching bets by game:', error)
      throw error
    }
  }

  /**
   * Transaction Analytics
   */
  async getTransactionFlow(params) {
    try {
      const response = await this.client.get('/transactions/flow', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching transaction flow:', error)
      throw error
    }
  }

  async exportTransactions(params) {
    try {
      const response = await this.client.get('/transactions/export', {
        params,
        responseType: params.format === 'csv' ? 'blob' : 'json',
      })
      return response.data
    } catch (error) {
      console.error('Error exporting transactions:', error)
      throw error
    }
  }

  /**
   * Performance Metrics
   */
  async getPerformanceMetrics(params) {
    try {
      const response = await this.client.get('/performance/metrics', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      throw error
    }
  }

  async getAffiliatePerformance(params) {
    try {
      const response = await this.client.get('/performance/affiliate', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching affiliate performance:', error)
      throw error
    }
  }

  /**
   * Real-Time Data
   */
  async getRealtimeUpdates() {
    try {
      const response = await this.client.get('/realtime/updates')
      return response.data
    } catch (error) {
      console.error('Error fetching realtime updates:', error)
      throw error
    }
  }

  /**
   * Export Dashboard
   */
  async exportDashboard(params) {
    try {
      const response = await this.client.get('/export', {
        params,
        responseType: params.format === 'csv' ? 'blob' : 'json',
      })
      return response.data
    } catch (error) {
      console.error('Error exporting dashboard:', error)
      throw error
    }
  }

  /**
   * Download Export File
   */
  downloadFile(data, filename, format = 'json') {
    try {
      let content, type, ext

      if (format === 'csv') {
        content = data
        type = 'text/csv'
        ext = '.csv'
      } else {
        content = JSON.stringify(data, null, 2)
        type = 'application/json'
        ext = '.json'
      }

      const blob = new Blob([content], { type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dashboard-export-${Date.now()}${ext}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Batch Request
   */
  async batchRequest(requests) {
    try {
      const promises = requests.map((req) =>
        this.client
          .get(req.endpoint, { params: req.params })
          .then((response) => ({
            endpoint: req.endpoint,
            data: response.data,
            success: true,
          }))
          .catch((error) => ({
            endpoint: req.endpoint,
            error: error.message,
            success: false,
          })),
      )

      const results = await Promise.allSettled(promises)
      return results.map((r) => r.value)
    } catch (error) {
      console.error('Error in batch request:', error)
      throw error
    }
  }

  /**
   * Request with Retry
   */
  async requestWithRetry(endpoint, params, maxRetries = 3) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.client.get(endpoint, { params })
        return response.data
      } catch (error) {
        lastError = error
        console.warn(`Attempt ${i + 1} failed for ${endpoint}, retrying...`)

        if (i < maxRetries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError
  }

  /**
   * Get Multiple Metrics in Parallel
   */
  async getMultipleMetrics(metricTypes, params) {
    const requests = metricTypes.map((type) => ({
      type,
      endpoint: `/${type}/statistics`,
      params,
    }))

    const results = await Promise.allSettled(
      requests.map((req) => this.client.get(req.endpoint, { params: req.params })),
    )

    return requests.reduce((acc, req, idx) => {
      if (results[idx].status === 'fulfilled') {
        acc[req.type] = results[idx].value.data
      } else {
        acc[req.type] = null
      }
      return acc
    }, {})
  }
}

// Create and export singleton instance
const dashboardAPI = new DashboardAPIService()

export default dashboardAPI
