// services/agentService.js
import { apiService } from './api';

export const agentService = {
  // Get all agents
  getAllAgents: async (params = {}) => {
    return await apiService.get('/agent', params);
  },

  // Get agent by ID
  getAgentById: async (id) => {
    return await apiService.get(`/agent/${id}`);
  },

  // Create new agent
  createAgent: async (agentData) => {
    return await apiService.post('/subadmin/auth/register_agent', agentData);
  },

  // Update agent
  updateAgent: async (id, agentData) => {
    return await apiService.put(`/agent/${id}`, agentData);
  },

  // Delete agent
  deleteAgent: async (id) => {
    return await apiService.delete(`/agent/${id}`);
  },

  // Get agent dashboard stats
  getAgentDashboard: async (agentId) => {
    return await apiService.get(`/agent_dashboard/${agentId}`);
  },

  // Get agent users
  getAgentUsers: async (agentId, params = {}) => {
    return await apiService.get(`/agent/${agentId}/users`, params);
  },

  // Update agent status
  updateAgentStatus: async (id, status) => {
    return await apiService.put(`/agent/${id}/status`, { status });
  },

  // Update agent balance
  updateAgentBalance: async (id, balanceData) => {
    return await apiService.put(`/agent/${id}/balance`, balanceData);
  },

  // Get agent transactions
  getAgentTransactions: async (agentId, params = {}) => {
    return await apiService.get(`/agent/${agentId}/transactions`, params);
  }
};

export default agentService;
