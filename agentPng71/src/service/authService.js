// services/authService.js
import { apiService } from './api';

export const authService = {
  register: async (userData) => {
    return await apiService.post('/agent/auth/register_agent', userData);
  },

  login: async (credentials) => {
    const response = await apiService.post('/agent/auth/agent_login', credentials);
console.log("Login response:", response, response.token);
    if (response && response.token) {
      const token = response.token;
      localStorage.setItem('admin_token', token);
      apiService.setToken(token);
    }

    return response;
  },

  getProfile: async () => {
    try {
      const response = await apiService.get('/agent/auth/agent_profile');

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
    return await apiService.put('/agent/agent_request_password_reset', passwordData);
  },
  // GetActiveAdminSessions: async () => {
  //   return await apiService.get('/Admin/auth/sessions/active');
  // },
  // ForceLogoutAdmin: async () => {
  //   return await apiService.get('/Admin/auth/force-logout/admin/:userId');
  // },
  registerUser: async (userData) => {
    return await apiService.post('/agent/auth/createUser', userData);
  },
  subAgentRegister: async (userData) => {
    return await apiService.post('/agent/auth/register_sub_agent', userData);
  },
  logout: () => {
    localStorage.removeItem('agent_token');
    apiService.setToken(null);
  },

  setToken: (token) => {
    apiService.setToken(token);
    if (token) localStorage.setItem('agent_token', token);
    else localStorage.removeItem('agent_token');
  },

  init: () => {
    const token = localStorage.getItem('agent_token');
    if (token) {
      apiService.setToken(token);
    }
  }
};

export default authService;