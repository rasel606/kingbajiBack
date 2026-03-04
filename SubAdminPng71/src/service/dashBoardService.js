// src/services/depositGetWayService.js
import {apiService} from './api';

export const dashBoardService = {
  // dashboardStats: async () => {
  //   const response = await apiService.get('/Admin/dashboard/overview');
  //   return response;
  // },
   dashboardStats: async () => {
    try {
      const response = await apiService.get('/subadmin/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Dashboard stats error:', error)
      throw error
    }
  },

  getPendingTransactions: async (type = 'deposit')=> {
    try {
      const endpoint = type === 'withdraw' 
        ? '/subadmin/dashboard/transactions/pending-withdrawals' 
        : '/subadmin/dashboard/transactions/pending-deposits'
      const response = await apiService.get(endpoint)
      return response.data
    } catch (error) {
      console.error('Pending transactions error:', error)
      throw error
    }
  },

  getUserList: async (userType = 'all') =>{
    try {
      const endpoints = {
        all: '/subadmin/dashboard/users/list',
        agents: '/agent_dashboard/users/agents',
        subagents: '/subadmin/dashboard/users/subagents'
      }
      const response = await apiService.get(endpoints[userType] || endpoints.all)
      return response.data
    } catch (error) {
      console.error('User list error:', error)
      throw error
    }
  },

  getRecentActivity:async()=> {
    try {
      const response = await apiService.get('/subadmin/dashboard/dashboard/recent-activity')
      return response.data
    } catch (error) {
      console.error('Recent activity error:', error)
      throw error
    }
  }
}
