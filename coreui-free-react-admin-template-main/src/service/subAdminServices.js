// src/service/getWayService.js
import { apiService } from './api'

export const subAdminServices = {
  SubAdminList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_adminList', params)
    return response // apiService.get already returns parsed JSON
  },
  SubAdminUserList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminDepositList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_pending_deposit_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminWithdrawList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_withdraw_deposit_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminAffiliateList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_affiliateList', params)
    return response // apiService.get already returns parsed JSON
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
}
