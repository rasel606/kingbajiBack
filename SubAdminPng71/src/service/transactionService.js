// services/transactionService.js
import { apiService } from './api';

export const transactionService = {
  // Get all transactions with filters
  getAllTransactions: async (params = {}) => {
    return await apiService.get('/transactions', params);
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    return await apiService.get(`/transactions/${id}`);
  },

  // Get user transactions
  getUserTransactions: async (userId, params = {}) => {
    return await apiService.get(`/transactions/user/${userId}`, params);
  },

  // Approve deposit
  approveDeposit: async (transactionId, data) => {
    return await apiService.put(`/transactions/deposit/approve/${transactionId}`, data);
  },

  // Reject deposit
  rejectDeposit: async (transactionId, data) => {
    return await apiService.put(`/transactions/deposit/reject/${transactionId}`, data);
  },

  // Approve withdrawal
  approveWithdrawal: async (transactionId, data) => {
    return await apiService.put(`/transactions/withdrawal/approve/${transactionId}`, data);
  },

  // Reject withdrawal
  rejectWithdrawal: async (transactionId, data) => {
    return await apiService.put(`/transactions/withdrawal/reject/${transactionId}`, data);
  },

  // Get pending transactions
  getPendingTransactions: async (params = {}) => {
    return await apiService.get('/transactions/pending', params);
  },

  // Get transaction statistics
  getTransactionStats: async (params = {}) => {
    return await apiService.get('/transactions/stats', params);
  },

  // Export transactions
  exportTransactions: async (params = {}) => {
    return await apiService.get('/transactions/export', params);
  }
};

export default transactionService;
