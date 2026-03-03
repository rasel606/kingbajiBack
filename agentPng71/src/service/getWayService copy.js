// src/service/getWayService.js
import { apiService } from './api';

export const getWayService = {
  searchTransactionsDeposit: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_deposit_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  searchTransactionsWidthrawal: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_Widthrawal_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  TransactionsDepositGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_deposit_getways', params);
    return response; // apiService.get already returns parsed JSON
  },
  TransactionsWEidthrawalGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_widthrawal_getways', params);
    return response; // apiService.get already returns parsed JSON
  },

  updateDepositStatus: async (transactionID, userId, actionType) => {

    console.log(transactionID, userId, actionType);
    // actionType: 1 = accept, 2 = reject
    const action = actionType === 1 ? 'accept' : 'reject';
    const response = await apiService.post('/transactions/update-deposit-Widthrowal', {
      transactionID,
      userId,
      action
    });
    return response;
  },
  // updateDepositStatus: async (transactionId, userId, status) => {
  //   const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
  //   return response;
  // },

  getDepositTotals: async (referredBy) => {
    const response = await apiService.get('/transactions/deposit-totals', { referredBy });
    return response;
  },

  

  // getTotalDeposit: async (referredBy) => {
  //   const response = await apiService.get('/transactions/total-deposit', { referredBy });
  //   return response;
  // }
};
