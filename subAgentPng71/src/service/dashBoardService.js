// src/services/depositGetWayService.js
import {apiService} from './api';

export const dashBoardService = {
  dashboardStats: async () => {
    const response = await apiService.get('/Admin/dashboard/overview');
    return response;
  },

//   updateDepositStatus: async (transactionId, status) => {
//     const response = await apiService.put(`/transactions/${transactionId}/status`, { status });
//     return response.data;
//   },

//   getTransactionTotals: async () => {
//     const response = await apiService.get('/transactions/totals');
//     return response.data;
//   },

//   getTotalDeposit: async () => {
//     const response = await apiService.get('/transactions/total-deposit');
//     return response.data;
//   },

//   getGatewayList: async (referralCode, email) => {
//     const response = await apiService.post('/subadmin/gateway-list', { referralCode, email });
//     return response.data;
//   }
};