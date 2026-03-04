// src/services/withdrawalService.js
import api from './api'

export const withdrawalService = {
  // Get withdrawal history
  getWithdrawalHistory: async (type = null, page = 1, limit = 10) => {
    const params = { page, limit }
    if (type) params.type = type

    const response = await api.get('/withdrawals', { params })
    return response.data
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData) => {
    const response = await api.post('/withdrawals', withdrawalData)
    return response.data
  },

  // Get withdrawal by ID
  getWithdrawalById: async (id) => {
    const response = await api.get(`/withdrawals/${id}`)
    return response.data
  },
}
