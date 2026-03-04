// src/service/getWayService.js
import { apiService } from './api';

export const getWayService = {
  searchTransactionsDeposit: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/search_deposit_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  searchTransactionsWidthrawal: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/search_Widthrawal_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  SubAgentTransactionsDeposit: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/Sub_agent_deposit_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  SubAgentTransactionsWidthrawal: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/Sub_agent_widthrow_transactions', params);
    return response; // apiService.get already returns parsed JSON
  },
  GetAllTransactions: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/agent_transactions_report', params);
    return response; // apiService.get already returns parsed JSON
  },
  TransactionsDepositGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/deposit_getWay_list', params);
    return response; // apiService.get already returns parsed JSON
  },
  TransactionsWidthrawalGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/subadmin/widthrow_getWay_list', params);
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
  updateDepositGatewayStatus: async (transactionId, userId, status) => {
    const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
    return response;
  },

  getDepositTotals: async (referredBy) => {
    const response = await apiService.get('/transactions/deposit-totals', { referredBy });
    return response;
  },

  

  // getTotalDeposit: async (referredBy) => {
  //   const response = await apiService.get('/transactions/total-deposit', { referredBy });
  //   return response;
  // }
};
