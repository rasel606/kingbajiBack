// services/paymentService.js
import { apiService } from './api';

export const paymentService = {
  // Payment Methods
  getAllPaymentMethods: async () => {
    return await apiService.get('/payment-methods');
  },

  getPaymentMethodById: async (id) => {
    return await apiService.get(`/payment-methods/${id}`);
  },

  createPaymentMethod: async (methodData) => {
    return await apiService.post('/payment-methods', methodData);
  },

  updatePaymentMethod: async (id, methodData) => {
    return await apiService.put(`/payment-methods/${id}`, methodData);
  },

  deletePaymentMethod: async (id) => {
    return await apiService.delete(`/payment-methods/${id}`);
  },

  togglePaymentMethod: async (id) => {
    return await apiService.put(`/payment-methods/${id}/toggle`);
  },

  // Hierarchical Gateway
  getGatewayConfig: async () => {
    return await apiService.get('/payment');
  },

  updateGatewayConfig: async (config) => {
    return await apiService.put('/payment/config', config);
  },

  // Process payments
  processDeposit: async (depositData) => {
    return await apiService.post('/payment/deposit', depositData);
  },

  processWithdrawal: async (withdrawalData) => {
    return await apiService.post('/payment/withdrawal', withdrawalData);
  },

  // Payment stats
  getPaymentStats: async (params = {}) => {
    return await apiService.get('/payment/stats', params);
  }
};

export default paymentService;
