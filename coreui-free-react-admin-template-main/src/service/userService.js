// src/service/getWayService.js
import { apiService } from './api'

export const userService = {
  GetUserList: async (params = {}) => {
    // Default pagination values
    const paginationParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...params, // Other filters
    }

    // Remove page and limit from params if you need to pass them differently
    // Some APIs expect offset/limit instead of page/limit
    const { page, limit, ...otherParams } = paginationParams

    // Calculate offset if your API needs it
    const offset = (page - 1) * limit

    // Adjust based on your API requirements
    const apiParams = {
      ...otherParams,
      page, // or use offset if your API expects it
      limit, // or use per_page
    }

    try {
      const response = await apiService.get('/admin/get_userList', apiParams)
      console.log('response user list', response)

      // Ensure the response has the expected structure
      return {
        data: response.data || response.users || response || [],
        total:
          response.total ||
          response.count ||
          (response.data ? response.data.length : response.length) ||
          0,
        page: response.page || page,
        limit: response.limit || limit,
      }
    } catch (error) {
      console.error('Error fetching user list:', error)
      throw error
    }
  },
}
