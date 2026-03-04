import { apiService } from './api';
export const gameManagementService = {
  // Categories
  getCategories: async(params = {}) => {
    const response = await apiService.get('/games/New-table-Games-with-Providers', { params })
  console.log("response", response);
    return response
  },
  createCategory: (data) => 
    apiService.post('/games/categories', data),
  
  updateCategory: (id, data) => 
    apiService.put(`/games/categories/${id}`, data),
  
  getCategoryById: (id, data) => 
    apiService.get(`/games/categories/${id}`, data),
  
  
  // Providers
  getProviders: (params = {}) => 
    apiService.get('/games/provider',  params ),
  
  createProvider: (data) => 
    apiService.post('/games/provider/providers', data),
  
  updateProvider: (id, data) => 
    apiService.put(`/games/provider/providers/${id}`, data),
  
  // Games
  getGamesWithProvidersByCategory: (params = {}) => 
    apiService.get('/games/game-list-filters', { params }),

  createGame: (data) =>
    apiService.post('/games/games', data),
  
  updateGame: (id, data) => 
    apiService.put(`/games/games/${id}`, data),

  deleteGame: (id) =>
    apiService.delete(`/games/games/${id}`),
  
  // Game Movement
  moveGamesToAnotherCategoryAndUpdateProviderList: (data) => 
    apiService.post('/games/games/move-games-between-categories', data),
};

export const getCategoriesWithProviders = (params = {}) =>
  gameManagementService.getCategories(params);

export const moveGamesToAnotherCategoryAndUpdateProviderList = (data) =>
  gameManagementService.moveGamesToAnotherCategoryAndUpdateProviderList(data);