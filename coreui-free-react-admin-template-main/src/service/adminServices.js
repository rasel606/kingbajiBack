// src/service/getWayService.js
import { apiService } from './api'

const tryGetFromEndpoints = async (endpoints, params = {}) => {
  let lastError

  for (const endpoint of endpoints) {
    try {
      return await apiService.get(endpoint, params)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Request failed for all fallback endpoints')
}

export const adminServices = {
  AdminAffiliateList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_admin_affiliateList', params)
    return response // apiService.get already returns parsed JSON
  },
  AdminAgentList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_admin_AgentList', params)
    return response // apiService.get already returns parsed JSON
  },
  AffiliateGetCommissionSettings: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/affiliate_get_commissionSettings', params)
    return response // apiService.get already returns parsed JSON
  },

  AgentList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_admin_agent_list', params)
    console.log('response usert', response.data)
    return response // apiService.get already returns parsed JSON
  },
  AgentUserList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_admin_agent_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  AgentDepositList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get(
      '/admin/get_admin_agent_user_pending_deposit_user_list',
      params,
    )
    return response.data // apiService.get already returns parsed JSON
  },
  AgentWithdrawList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get(
      '/admin/get_admin_agent_user_withdraw_deposit_user_list',
      params,
    )
    return response.data // apiService.get already returns parsed JSON
  },

  getRebateSettings: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_rebate_settings')
    return response // apiService.get already returns parsed JSON
  },
  // getBonuses: async (params = {}) => {
  //   // ✅ use GET with query params
  //   const response = await apiService.get('/subadmin/get_bonus_list');
  //   return response; // apiService.get already returns parsed JSON
  // },
  getBonuses: async (params = {}) => {
    return await tryGetFromEndpoints(
      [
        '/promotions/admin/bonuses',
        '/promotions/bonuses',
        '/admin/get_bonus_list',
        '/transactions/get_bonus_list',
      ],
      params,
    )
  },

  // ✅ Get categories for bonuses
  getCategories: async () => {
    return await tryGetFromEndpoints([
      '/games/categories',
      '/games/New-table-Games-with-Providers',
      '/admin/categories',
      '/admin/get_categories_with_providers_and_games',
    ])
  },

  // ✅ Create a new bonus
  createBonus: async (data) => {
    const response = await apiService.post('/promotions/bonuses', data)
    return response
  },

  // ✅ Update an existing bonus
  updateBonus: async (bonusId, data) => {
    console.log('updateBonus', bonusId, data)
    const response = await apiService.put(`/promotions/bonuses/${bonusId}`, data)
    return response
  },
  updateAndCreateSocialLinks: async (data) => {
    const response = await apiService.put(`/dashboard/update_social_link`, data)
    return response
  },
  getSocialLinks: async () => {
    const response = await apiService.get(`/admin/dashboard/social_link`)
    console.log(response)
    return response.data
  },

  // ✅ Delete a bonus
  deleteBonus: async (bonusId) => {
    const response = await apiService.delete(`/promotions/bonuses/${bonusId}`)
    return response
  },

  getUsersByReferral: async () => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_admin_UserList')
    return response // apiService.get already returns parsed JSON
  },
  getUserById: async (userId) => {
    const response = await apiService.get(`/admin/get_users_by_Id/${userId}`)
    return response.data
  },

  // Update user profile
  updateUserProfileById: async (userId, data) => {
    console.log(userId, data)
    const response = await apiService.put(`/admin/get_users_by_Id_update/${userId}`, data)
    return response.data
  },

  // Verify email
  verifyEmailForUser: async (userId) => {
    const response = await apiService.post(`/admin/get_users_verify-email/${userId}`)
    return response.data
  },

  // Verify phone
  verifyPhoneForUser: async (userId) => {
    const response = await apiService.post(`/admin/get_users_verify-phone/${userId}`)
    return response.data
  },
  changeUserPassword: async (userId, password) => {
    console.log(userId, password)
    const { data } = await apiService.post(`/admin/get_users_update-password/${userId}`, {
      newPassword: password,
    })
    return data
  },
  getUserTransactionsById: async (userId, payload) => {
    if (!userId) throw new Error('UserId is required')

    const response = await apiService.put(`/admin/get_users_transfar_by_Id/${userId}`, payload)
    return response.data // apiService.put returns parsed JSON
  },

  updateDepositwidthrowalStatus: async (transactionID, userId, actionType) => {
    console.log(transactionID, userId, actionType)
    // actionType: 1 = accept, 2 = reject
    const status = actionType === 1 ? 1 : 2
    const response = await apiService.get('/transactions/update-deposit-Widthrowal', {
      transactionID,
      userId,
      status,
    })
    return response
  },

  depositAndWidthraw_ByAdmin: async (userId, type, amount) => {
    console.log(userId, type, amount)

    const response = await apiService.get('/admin/get_user_deposit_withdraw__user', {
      userId,
      type,
      amount,
    })
    return response
  },
  // updateDepositwidthrowalStatus(transactionID, userId, actionType) {
  // const status = actionType === 1 ? 1 : 0;
  // return apiService.get('/transactions/update-deposit-Widthrowal', {
  //   params: { transactionID, userId, status }
  // });

  getApiBalanceStats: async () => {
    try {
      const response = await apiService.get('/admin/update-admin-balance')
      console.log('API balance stats response:', response)
      return response
    } catch (error) {
      console.error('API balance stats error:', error)
      throw error
    }
  },
  getCategoriesWithProvidersAndGames: async () => {
    const result = await apiService.get('/admin/get_categories_with_providers_and_games')
    console.log('/New-table-Games-with-Category-with-Providers', result)
    return result
  },
}
