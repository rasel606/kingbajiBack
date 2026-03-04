// services/authService.js
import { apiService } from './api';

export const authService = {
  register: async (userData) => {
    return await apiService.post('/subadmin/auth/register_Sub_admin', userData);
  },

  login: async (credentials) => {
    const response = await apiService.post('/subadmin/auth/login_sub_admin', credentials);
console.log("Login response:", response, response.token);
    if (response && response.token) {
      const token = response.token;
      localStorage.setItem('subadmin_token', token);
      apiService.setToken(token);
    }

    return response;
  },

  getProfile: async () => {
    try {
      const response = await apiService.get('/subadmin/auth/main_sub_admin');

      // Handle different response structures
      if (response.data) {
        return response.data; // If backend returns { success: true, data: user }
      } else if (response.user) {
        return response.user; // If backend returns { user }
      } else {
        return response; // If backend returns user object directly
      }
    } catch (error) {
      console.error("getProfile error:", error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    return await apiService.put('/subadmin/agent_request_password_reset', passwordData);
  },
  // GetActiveAdminSessions: async () => {
  //   return await apiService.get('/Admin/auth/sessions/active');
  // },
  // ForceLogoutAdmin: async () => {
  //   return await apiService.get('/Admin/auth/force-logout/admin/:userId');
  // },
  registerUser: async (userData) => {
    return await apiService.post('/subadmin/auth/createUser', userData);
  },
  agentRegister: async (userData) => {
    return await apiService.post('/subadmin/auth/register_agent', userData);
  },
  subAgentRegister: async (userData) => {
    return await apiService.post('/subadmin/auth/register_sub_agent', userData);
  },
  AffiliateRegister: async (userData) => {
    return await apiService.post('/subadmin/auth/register_affiliate', userData);
  },
  logout: () => {
    localStorage.removeItem('subadmin_token');
    apiService.setToken(null);
  },

  setToken: (token) => {
    apiService.setToken(token);
    if (token) localStorage.setItem('subadmin_token', token);
    else localStorage.removeItem('subadmin_token');
  },

  init: () => {
    const token = localStorage.getItem('subadmin_token');
    if (token) {
      apiService.setToken(token);
    }
  }
};

export default authService;