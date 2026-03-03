
// src/service/getWayService.js
import { apiService } from './api';

export const adminServices = {

  getUsersByReferral: async () => {
    // ✅ use GET with query params
    const response = await apiService.get('/Admin/get_admin_UserList');
    return response; // apiService.get already returns parsed JSON
  },
  getUserById: async (userId) => {
    const response = await apiService.get(`/subadmin/get_users_by_Id/${userId}`);
    console.log(response);
    return response.data;
  },

  // Update user profile
  updateUserProfileById: async (userId, data) => {
    console.log(userId, data);
    const response = await apiService.put(`/subadmin/get_users_by_Id_update/${userId}`, data);
    return response.data;
  },

  // Verify email
  verifyEmailForUser: async (userId) => {
    const response = await apiService.post(`/subadmin/get_users_verify-email/${userId}`);
    return response.data;
  },

  // Verify phone
  verifyPhoneForUser: async (userId) => {
    const response = await apiService.post(`/subadmin/get_users_verify-phone/${userId}`);
    return response.data;
  },
  changeUserPassword: async (userId, password) => {
    const { data } = await apiService.put(`/subadmin/get_users_by_Id_Password_update/${userId}`, { password });
    return data;
  },
  getUserTransactionsById: async (userId, payload) => {
    if (!userId) throw new Error("UserId is required");

    const response = await apiService.put(`/subadmin/get_users_transfar_by_Id/${userId}`, payload);
    return response.data; // apiService.put returns parsed JSON
  },
  updateDepositwidthrowalStatus: async (transactionID, userId, actionType) => {

    console.log(transactionID, userId, actionType);
    // actionType: 1 = accept, 2 = reject
    const action = actionType === 1 ? 'accept' : 'reject';
    const response = await apiService.post('/transactions/update-deposit-Widthrowal', {
      transactionID,
      userId,
      action
    });
    return response;
  }
,
getCategoriesWithProvidersAndGames: async () =>
    await apiService.get("/Admin/get_categories_with_providers_and_games"),
  


};
