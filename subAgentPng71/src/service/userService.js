// src/service/getWayService.js
import { apiService } from './api';

export const userService = {
  GetUserList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/sub_agent/get_userList', params);
    console.log('response usert', response)
    return response; // apiService.get already returns parsed JSON
  },
//   searchTransactionsWidthrawal: async (params = {}) => {
//     // ✅ use GET with query params
//     const response = await apiService.get('/transactions/search_Widthrawal_transactions', params);
//     return response; // apiService.get already returns parsed JSON
//   },
//   TransactionsDepositGetways: async (params = {}) => {
//     // ✅ use GET with query params
//     const response = await apiService.get('/transactions/search_deposit_getways', params);
//     return response; // apiService.get already returns parsed JSON
//   },
//   TransactionsWEidthrawalGetways: async (params = {}) => {
//     // ✅ use GET with query params
//     const response = await apiService.get('/transactions/search_widthrawal_getways', params);
//     return response; // apiService.get already returns parsed JSON
//   },

//   updateDepositStatus: async (transactionId, userId, status) => {
//     const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
//     return response;
//   },
//   updateDepositStatus: async (transactionId, userId, status) => {
//     const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
//     return response;
//   },

//   getDepositTotals: async (referredBy) => {
//     const response = await apiService.get('/transactions/deposit-totals', { referredBy });
//     return response;
//   },

  // getTotalDeposit: async (referredBy) => {
  //   const response = await apiService.get('/transactions/total-deposit', { referredBy });
  //   return response;
  // }
};
